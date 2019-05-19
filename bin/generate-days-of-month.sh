#!/usr/bin/env bash

# See https://vaneyckt.io/posts/safer_bash_scripts_with_set_euxo_pipefail/
set -euxo pipefail

BUCKET="sound-clips-032721237383"

for DIGIT in $(seq 1 31); do
    TEXT="${DIGIT}日"
    LOCAL_FILE="${DIGIT}.mp3"

    aws polly synthesize-speech  \
        --output-format mp3  \
        --text "${TEXT}"  \
        --voice-id Mizuki  \
        "${LOCAL_FILE}" > /dev/null

    aws s3 cp  \
        "${LOCAL_FILE}"  \
        "s3://${BUCKET}/days-of-month/"
done