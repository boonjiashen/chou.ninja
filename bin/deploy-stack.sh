#!/usr/bin/env bash

# See https://vaneyckt.io/posts/safer_bash_scripts_with_set_euxo_pipefail/
set -euxo pipefail

export AWS_DEFAULT_REGION="ap-northeast-1"

STACK_NAME="api-gateway-8"
PARENT_TEMPLATE="cloudformation/stack.yml"
PARAMETER_OVERRIDES=${@:2}
ACCOUNT_ID=$( aws sts get-caller-identity --output text --query Account )
TEMPLATE_BASENAME=$( basename ${PARENT_TEMPLATE%.*} )

S3_BUCKET="cloud-formation-staging-area-${ACCOUNT_ID}"
./bin/create-bucket-if-not-exist.sh ${S3_BUCKET}

UTC_TIMESTAMP=$( date -u +%FT%TZ )
S3_PREFIX="${USER}/${UTC_TIMESTAMP}"
TMP_BUILT_PARENT_TEMPLATE="$( mktemp /tmp/parent_template.XXXXXX ).yml"

aws cloudformation validate-template  \
    --template-body "file://${PARENT_TEMPLATE}"

aws cloudformation package  \
  --template-file ${PARENT_TEMPLATE}  \
  --s3-bucket ${S3_BUCKET}  \
  --s3-prefix ${S3_PREFIX}  \
  --output-template-file ${TMP_BUILT_PARENT_TEMPLATE}  \

aws cloudformation deploy  \
  --template-file ${TMP_BUILT_PARENT_TEMPLATE}  \
  --stack-name ${STACK_NAME}  \
  --capabilities CAPABILITY_IAM  \
  ${PARAMETER_OVERRIDES}  \
