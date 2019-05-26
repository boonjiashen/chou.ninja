#!/usr/bin/env bash

export AWS_DEFAULT_REGION="ap-northeast-1"

STACK_NAME="api-gateway-3"
TEMPLATE_FILE="cloudformation/stack.yml"

aws cloudformation deploy  \
    --template-file ${TEMPLATE_FILE}  \
    --stack-name ${STACK_NAME}  \
    --capabilities CAPABILITY_IAM