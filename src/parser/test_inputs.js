const test1 = "\
input: \
    a number \
    b number \
    c number \
    d vector \
\
output: \
    number: (d.y + a) * b  \
    number: a * b \
    number: (d.x + c) / b \
";



const test2 = "\
input: \
    a number \
    b number \
    c number \
\
output: \
    number: * + 2 c 2 \
    number: * a PI \
";

const outputsFirst = "\
output: \
    number: * a b \
    number: + + a b 1\
input: \
    a number \
    b number \
";

const unknownVar = "\
input: \
    a number \
    b number \
output: \
    number: * c b \
    number: + + a b 1\
";

export { test1 }