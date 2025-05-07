import json
import boto3
import os
import base64

s3 = boto3.client('s3')
polly = boto3.client('polly')
sns = boto3.client('sns')

INPUT_BUCKET = os.environ['INPUT_BUCKET']
OUTPUT_BUCKET = os.environ['OUTPUT_BUCKET']
SNS_TOPIC_ARN = os.environ['SNS_TOPIC_ARN']

ALLOWED_ORIGIN = os.environ['ALLOWED_ORIGIN']
CORS_HEADERS = {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token"
}


def lambda_handler(event, context):
    print("Received event:", json.dumps(event))
    
    method = event.get("httpMethod", "")
    # Handle preflight OPTIONS request
    if method == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": ""
        }

    # ✅ Handle POST request
    if method == "POST": 
        try: 
            # Case 1: Triggered by S3 upload (i.e., the .txt input file)
            if 'Records' in event and event['Records'][0]['eventSource'] == 'aws:s3':
                for record in event['Records']:
                    bucket_name = record['s3']['bucket']['name']
                    object_key = record['s3']['object']['key']
                    process_text_file(bucket_name, object_key)
                    
                return create_response(200, "S3 event processed successfully.")

            # Case 2: Triggered by API Gateway
            elif 'body' in event:
                try:
                    body = event['body']
                    if event.get("isBase64Encoded"):
                        body = base64.b64decode(body).decode("utf-8")
                    data = json.loads(body)
                except Exception as e:
                    print("Error parsing body:", str(e))
                    return create_response(400, "Invalid JSON body")

                text = data.get('text')
                filename = data.get('filename', 'output')
                if text:
                    upload_text_to_input_bucket(text, filename)
                    presigned_url = synthesize_text_to_audio(text, filename)
                    
                    if not presigned_url:
                        return create_response(500, "Failed to generate audio file. Please try again later.")

                    return create_response(200, 
                                        "Audio conversion successful.", 
                                        {"url": presigned_url,
                                            "name": f"{filename}.mp3",
                                        })
                else:
                    return create_response(400, "Missing 'text' in request body")

            else:
                return create_response(400, "Invalid trigger source")
        except Exception as e:
            return {
                "statusCode": 500,
                "headers": CORS_HEADERS,
                "body": json.dumps({"error": str(e)})
            }
     # Unsupported methods
    return {
        "statusCode": 405,
        "headers": CORS_HEADERS,
        "body": json.dumps({"error": "Method not allowed"})
    }

def upload_text_to_input_bucket(text, filename):
    key = f"{filename}.txt"
    s3.put_object(
        Bucket=INPUT_BUCKET,
        Key=key,
        Body=text.encode('utf-8')
    )
    
    print(f"Uploaded text to {INPUT_BUCKET}/{key}")


def process_text_file(bucket_name, object_key):
    try:
        response = s3.get_object(Bucket=bucket_name, Key=object_key)
        text = response['Body'].read().decode('utf-8')
        filename = os.path.splitext(os.path.basename(object_key))[0]
        synthesize_text_to_audio(text, filename)
    except Exception as e:
        print(f"Error processing file {object_key}: {str(e)}")


def synthesize_text_to_audio(text, filename):
    try:
        response = polly.synthesize_speech(
            Text=text,
            OutputFormat='mp3',
            VoiceId='Joanna'
        )

        output_key = f"{filename}.mp3"
        s3.put_object(
            Bucket=OUTPUT_BUCKET,
            Key=output_key,
            Body=response['AudioStream'].read(),
            ACL='bucket-owner-full-control'
        )
        print(f"Audio saved to {OUTPUT_BUCKET}/{output_key}")

        presigned_url = s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': OUTPUT_BUCKET, 'Key': output_key},
            ExpiresIn=600  # valid for 10 minutes
        )
        print(f"Presigned URL for audio: {presigned_url}")

        sns.publish(
            TopicArn=SNS_TOPIC_ARN,
            Subject="Text-to-Speech Conversion Complete",
            Message=f"The text file '{filename}.txt' has been converted to audio and saved as '{output_key}'.\nAccess it here (valid 5 min): {presigned_url}"
        )
        print(f"SNS notification sent for {output_key}")

        return presigned_url

    except Exception as e:
        print(f"Error during text-to-speech conversion: {str(e)}")
        return None


def create_response(status_code, message, data=None):
    body = {"message": message}
    if data:
        body.update(data)
    return {
        "statusCode": status_code,
        "headers": CORS_HEADERS,
        "body": json.dumps(body)
    }
    