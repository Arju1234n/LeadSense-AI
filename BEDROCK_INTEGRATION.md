# Amazon Bedrock API Integration

## Summary
Successfully integrated Amazon Bedrock API into the GrowEasy CSV Importer platform as an additional AI provider option.

## Changes Made

### 1. Package Installation
- Installed `@aws-sdk/client-bedrock-runtime` package for Bedrock API integration

### 2. Configuration Files

#### [`backend/src/config/ai.ts`](backend/src/config/ai.ts)
- Added BedrockRuntimeClient import
- Initialized Bedrock client with credentials decoded from base64-encoded API key
- Added support for Bedrock in `getAIClient()` function
- Updated `getModelName()` with default Bedrock model: `anthropic.claude-3-5-sonnet-20241022-v2:0`

#### [`backend/src/config/env.ts`](backend/src/config/env.ts)
- Already had support for `bedrock` AI provider
- `BEDROCK_API_KEY` and `AWS_REGION` configuration validated

### 3. AI Extractor Service

#### [`backend/src/services/ai/aiExtractor.service.ts`](backend/src/services/ai/aiExtractor.service.ts)
- Added `callBedrock()` function with support for multiple model types:
  - **Anthropic Claude models** (e.g., `anthropic.claude-3-5-sonnet-20241022-v2:0`)
  - **Amazon Titan models** (e.g., `amazon.titan-text-express-v1`)
  - **Meta Llama models** (e.g., `meta.llama2-70b-chat-v1`)
  - Generic fallback for other models
- Integrated Bedrock into the provider switch case in `callAIProvider()`
- Added approximate cost calculation for Bedrock usage

### 4. Environment Configuration

#### [`backend/.env`](backend/.env)
- Set `AI_PROVIDER=bedrock`
- Added `BEDROCK_API_KEY` with your base64-encoded credentials
- Added `AWS_REGION=us-east-1`
- Updated `AI_MODEL=anthropic.claude-3-5-sonnet-20241022-v2:0`

#### [`backend/.env.example`](backend/.env.example)
- Added Bedrock configuration template
- Documented base64 encoding format for API key

## API Key Format

The Bedrock API key is base64-encoded in the format:
```
base64_encode(accessKeyId:secretAccessKey)
```

The system automatically decodes this and extracts:
- AWS Access Key ID
- AWS Secret Access Key

## Supported Bedrock Models

The integration supports various Bedrock model families:

### Claude Models (Anthropic)
- `anthropic.claude-3-5-sonnet-20241022-v2:0` (default)
- `anthropic.claude-3-sonnet-20240229-v1:0`
- `anthropic.claude-3-haiku-20240307-v1:0`

### Titan Models (Amazon)
- `amazon.titan-text-express-v1`
- `amazon.titan-text-lite-v1`

### Llama Models (Meta)
- `meta.llama2-70b-chat-v1`
- `meta.llama2-13b-chat-v1`

## Usage

To use Bedrock API:

1. Ensure your `.env` file has:
   ```env
   AI_PROVIDER=bedrock
   BEDROCK_API_KEY=<your-base64-encoded-key>
   AWS_REGION=us-east-1
   AI_MODEL=anthropic.claude-3-5-sonnet-20241022-v2:0
   ```

2. The system will automatically use Bedrock for all AI extraction operations

3. Monitor logs for successful initialization:
   ```
   Amazon Bedrock client initialized successfully
   ```

## Cost Estimation

Approximate costs per 1K tokens (using Claude on Bedrock):
- Input: $0.0003
- Output: $0.0015

## Testing

To test the integration:

```bash
cd backend
npm run dev
```

Upload a CSV file through the application and verify that:
- Bedrock client initializes successfully
- AI extraction works properly
- Logs show Bedrock provider being used

## Troubleshooting

### Common Issues

1. **Invalid credentials**: Verify your base64-encoded API key contains `accessKeyId:secretAccessKey`
2. **Region errors**: Ensure the AWS region supports Bedrock and your chosen model
3. **Model not found**: Verify the model ID is correct and available in your region

### Debug Logs

Set `LOG_LEVEL=debug` in `.env` to see detailed Bedrock API calls and responses.

## Security Notes

- The `.env` file contains sensitive credentials and should never be committed to version control
- The `.gitignore` already excludes `.env` files
- Keep your AWS credentials secure and rotate them regularly
- Use AWS IAM policies to restrict Bedrock access to only necessary models

## Next Steps

- Test with different Bedrock models by changing `AI_MODEL` in `.env`
- Monitor AWS CloudWatch for Bedrock usage and costs
- Configure IAM roles for production deployment
- Consider using AWS Secrets Manager for production credentials
