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

let irv = (initialCandidates, votes)=> {
    let election = {
        initialCandidates,
        votes,
        stages: []
    };
    let remainingCandidates = [...election.initialCandidates];
    initialVoteAssign(election.votes, remainingCandidates);
    while(!majority(remainingCandidates)) {
        var last = getLastPlaceCandidate(remainingCandidates);
        remainingCandidates.splice(remainingCandidates.indexOf(last), 1);
        reassignVotes(last, remainingCandidates);
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