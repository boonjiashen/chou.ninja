#!/usr/bin/env bash

# See https://vaneyckt.io/posts/safer_bash_scripts_with_set_euxo_pipefail/
set -euxo pipefail

BUCKET="sound-clips-032721237383"

for TEXT in $(seq 0 10); do
    LOCAL_FILE="${TEXT}.mp3"

    aws polly synthesize-speech  \
        --output-format mp3  \
        --text "${TEXT}"  \
        --voice-id Mizuki  \
        "${LOCAL_FILE}" > /dev/null

    aws s3 cp  \
        "${LOCAL_FILE}"  \
        "s3://${BUCKET}/digits/"
done