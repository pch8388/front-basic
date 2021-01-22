function solution(priorities, location) {
    const r = priorities.reduce((arr, val, idx) => {
        arr.push({idx, val});
        return arr;
    }, []);

    let answer = 0;
    while (r.length > 0) {
        const max = Math.max(...priorities);
        const cur = r.shift();
        if (max === cur.val) {
            answer++;
            priorities.splice(priorities.indexOf(max), 1);
            if (cur.idx === location) {
                return answer;
            }
        } else {
            r.push(cur);
        }
    }

    return answer;
}

console.log(solution([2, 1, 3, 2], 2) === 1);
console.log(solution([1, 1, 9, 1, 1, 1], 0) === 5);