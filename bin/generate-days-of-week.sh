#!/usr/bin/env bash

# See https://vaneyckt.io/posts/safer_bash_scripts_with_set_euxo_pipefail/
set -euxo pipefail

BUCKET="sound-clips-032721237383"
declare -a DAYS=(
                "月"
                "火"
                "水"
                "木"
                "金"
                "土"
                "日"
                )

for DAY in "${DAYS[@]}"; do
    TEXT="${DAY}曜日"
    LOCAL_FILE="${DAY}.mp3"

    aws polly synthesize-speech  \
        --output-format mp3  \
        --text "${TEXT}"  \
        --voice-id Mizuki  \
        "${LOCAL_FILE}" > /dev/null

    aws s3 cp  \
        "${LOCAL_FILE}"  \
        "s3://${BUCKET}/days-of-week/"
done