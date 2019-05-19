#!/usr/bin/env bash

for TEXT in $(seq 0 10); do
    aws polly start-speech-synthesis-task --output-format mp3  \
        --output-s3-bucket-name sound-clips-032721237383  \
        --output-s3-key-prefix "${TEXT}/clip"  \
        --text "${TEXT}"  \
        --voice-id Mizuki
done