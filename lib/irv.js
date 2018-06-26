let getVotes = c=>c.votes ? c.votes.length : 0;

let majority = (candidates)=> {
    let total = candidates.reduce((totalVotes, c)=> totalVotes+getVotes(c), 0);
    return candidates.filter(c=>getVotes(c)>(total/2))[0];
};

let initialVoteAssign = (votes, candidates)=> {
    for(let vote of votes) {
        let candidate = candidates.find(c=>c.id === vote.choices[0]);
        if(!candidate.votes) candidate.votes = [];
        candidate.votes.push(vote);
    }
};

let reassignVotes = (reassignee, candidates)=> {
    let votes = reassignee.votes;
    if (!votes) return;
    votes.forEach(vote=> {
        let choiceIndex = vote.choices.findIndex(c=>c === reassignee.id);
        for (let nC = choiceIndex+1; nC<vote.choices.length; nC++) {
            let nextChoiceIndex = candidates.findIndex(c=>c.id === vote.choices[nC]);
            if(nextChoiceIndex === -1) continue;
            candidates[nextChoiceIndex].votes.push(vote);
            break;
        }
    });
    reassignee.votes = [];
};

let getLastPlaceCandidate = (candidates) => {
    return candidates.sort((a,b)=> getVotes(a)>getVotes(b))[0];
};

let getState = (candidates) => {
    let state = {};
    for (let candidate of candidates) {
        let candState = { null: 0 };
        if(!candidate.votes) continue;
        candidate.votes.forEach(vote=> {
            let choiceIndex = vote.choices.findIndex(c=>c === candidate.id);
            for (let nC = choiceIndex+1; nC<vote.choices.length; nC++) {
                let nextChoice = candidates.find(c=>c.id === vote.choices[nC]);
                if(!nextChoice) continue;
                if(!candState[nextChoice.id]) candState[nextChoice.id] = 0;
                candState[nextChoice.id] += 1;
                return;
            }
            candState[null] += 1;
        });
        state[candidate.id] = candState;
    }
    return state;
};

let irv = (initialCandidates, votes)=> {
    let election = {
        initialCandidates,
        votes,
        stages: []
    };
    let remainingCandidates = [...election.initialCandidates];
    initialVoteAssign(election.votes, remainingCandidates);
    election.stages.push(getState(remainingCandidates));
    while(!majority(remainingCandidates)) {
        var last = getLastPlaceCandidate(remainingCandidates);
        remainingCandidates.splice(remainingCandidates.indexOf(last), 1);
        reassignVotes(last, remainingCandidates);
        election.stages.push(getState(remainingCandidates));
    }
    // console.log(majority(remainingCandidates));
    election.winner = majority(remainingCandidates);
    return election;
};

module.exports = {
    getVotes,
    majority,
    initialVoteAssign,
    reassignVotes,
    getLastPlaceCandidate,
    irv,
};