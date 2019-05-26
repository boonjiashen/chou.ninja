#!/usr/bin/env bash

if [[ $# -ne 1 ]];
then
    echo "Error! You have $# argument(s). Should run script with one argument, which is the S3 bucket."
    exit 0
fi

S3_BUCKET=$1

if aws s3api head-bucket --bucket ${S3_BUCKET} 2>/dev/null;
then
  echo "Bucket ${S3_BUCKET} already exists"
else
  aws s3 mb "s3://${S3_BUCKET}" ||  \
    { echo 'Could not create bucket' ; exit 1; }
fi