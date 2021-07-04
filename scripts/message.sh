#!/bin/bash

hex_count() {
    HEX_CONTENT_LENGTH=$(printf '%08x' $@)
    HEX_CHAR_COUNT=0
    HEX_CHAR_BUFF=""
    for (( i=0; i<${#HEX_CONTENT_LENGTH}; i++ )); do
        HEX_CHAR_BUFF="${HEX_CHAR_BUFF}${HEX_CONTENT_LENGTH:$i:1}"
        if [ "$(($i%2))" = "1" ]; then
            echo $HEX_CHAR_BUFF
            HEX_CHAR_BUFF=""
        fi
    done
}

for b in $(tac <<EOF
$(hex_count $(wc -c $@ | sed 's| .*$||g'))
EOF
); do
    printf "%b" "\x$b"
done
echo -n $(cat $@)
