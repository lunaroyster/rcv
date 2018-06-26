const test = require('ava');
const irv = require('./irv');

let c = (voteCount, id) => {
    let votes = [];
    for (let i = 0; i < voteCount; i++) votes.push(new Object());
    let cand = {votes};
    if(id) cand.id = id;
    return cand;
};

let v = (...choices) => {
    let vote = {
        choices,
    };
    return vote;
};

test('getVotes() gets vote counts accurately', t => {
    let testCases = [
        {c: {}, v: 0},
        {c: {votes: []}, v: 0},
        {c: c(1), v: 1},
        {c: c(2), v: 2},
        {c: c(3), v: 3},
    ];
    for (let testCase of testCases) {
        t.is(irv.getVotes(testCase.c), testCase.v);
    }	
});

test('majority() gets a candidate with a majority, if there is one', t => {
    let cands = [
        [c(3), c(2), c(0)],
        [c(3), c(2), c(1)],
        [c(2), c(4)],
        [c(4)],
        [c(5), c(5)],
        [c(5), c(6)]
    ];
    let maj = [
        cands[0][0],
        undefined,
        cands[2][1],
        cands[3][0],
        undefined,
        cands[5][1]
    ];
    for (let i = 0; i<cands.length; i++) {
        t.is(irv.majority(cands[i]), maj[i]);
    }
});

test('initialVoteAssign() assigns votes to the correct candidates', t => {
    let cands = [
        c(0, 'a'),
        c(0, 'b'),
        c(0, 'c'),
    ];
    let votes = [
        v('a', 'b', 'c'),
        v('a', 'c'),
        v('a'),
        v('b', 'c'),
        v('b', 'a'),
    ];
    irv.initialVoteAssign(votes, cands);
    t.is(irv.getVotes(cands[0]), 3);
    t.is(irv.getVotes(cands[1]), 2);
    t.is(irv.getVotes(cands[2]), 0);
});

test('reassignVotes() reassigns votes of an eliminated candidate to other candidates', t => {
    let cands = [
        c(0, 'a'),
        c(0, 'b'),
        c(0, 'c'),
        c(0, 'd'),
    ];
    let votes = [
        v('a'), v('a'), v('a'), v('a'), v('a'),
        v('b'), v('b'), v('b'), v('b'),
        v('c', 'b'),
        v('c', 'd'),
        v('c', 'd'),
        v('d', 'b'),
        v('d'),
    ];
    irv.initialVoteAssign(votes, cands);
    
    irv.reassignVotes(cands[3], [cands[0], cands[1], cands[2]]);
    t.is(irv.getVotes(cands[0]), 5);
    t.is(irv.getVotes(cands[1]), 5);
    t.is(irv.getVotes(cands[2]), 3);
    t.is(irv.getVotes(cands[3]), 0);
    
    irv.reassignVotes(cands[2], [cands[0], cands[1]]);
    t.is(irv.getVotes(cands[0]), 5);
    t.is(irv.getVotes(cands[1]), 6);
});

test('getLastPlaceCandidate() returns the candidates with the least votes (with no tie conditions)', t => {
    let cands = [
        [c(3), c(2), c(1), c(0)],
        [c(3), c(2), c(1)],
        [c(3), c(2)],
        [c(3)],
    ];
    let lastPlaceCand = [
        cands[0][3],
        cands[1][2],
        cands[2][1],
        cands[3][0],
    ];
    for (let i = 0; i<cands.length; i++) {
        t.is(irv.getLastPlaceCandidate(cands[i]), lastPlaceCand[i]);
    }
});

test('irv() produces the instant-runoff winner, given candidates and votes (with no tie conditions)', t => {
    let cands = [
        c(0, 'a'),
        c(0, 'b'),
        c(0, 'c'),
        c(0, 'd'),
    ];
    let votes = [
        v('a'), v('a'), v('a'), v('a'), v('a'),
        v('b'), v('b'), v('b'), v('b'),
        v('c', 'b'),
        v('c', 'd'),
        v('c', 'd'),
        v('d', 'b'),
        v('d'),
    ];
    t.is(irv.irv(cands, votes).winner, cands[1]);
});
