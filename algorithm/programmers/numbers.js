function solution(n) {
    let x = n;
    const arr = [];
    while (x > 3) {
        let y = x % 3;
        if (y === 0) {
            arr.push(3);
            x = Math.floor(x / 3) - 1;
        } else {
            arr.push(y);
            x = Math.floor(x / 3);
        }
    }
    arr.push(x);

    return arr.reduce((pre, data) => {
        if (data === 3) {
            pre = 4 + pre;
        } else {
            pre = data + pre;
        }

        return pre;
    }, '');
}

console.log(solution(1));
console.log(solution(2));
console.log(solution(3));
console.log(solution(4));
console.log(solution(10));
console.log(solution(11));
console.log(solution(12));
console.log(solution(13));
console.log(solution(14));
console.log(solution(15));
console.log(solution(40));