require('dotenv').config()
const ghGot = require('gh-got')
const token = process.env.TOKEN

async.series({
  deleteIssues: cb => {
    // Delete the issues
    ghGot('repos/piascikj/imdone-example/issues', {token}).then(res => {
      let issues = res.body
      if (!issues || issues.length === 0) return cb()
      issues.forEach(issues => {
        let body = {state: 'closed'}
        ghGot.patch(`repos/piascikj/imdone-example/issues/${issue.number}`, {token, body})
        .then(res => cb(null, res.body))
        .catch(cb)
      })
    }).catch(cb)
  },
  closePR: cb => {
    ghGot('repos/piascikj/imdone-example/pulls', {token}).then(res => {
      let pulls = res.body
      if (!pulls || pulls.length === 0) return cb()
      res.body.forEach(pr => {
        let body = {state: 'closed'}
        ghGot.patch(`repos/piascikj/imdone-example/pulls/${pr.number}`, {token, body})
        .then(res => cb(null, res.body))
        .catch(cb)
      })
    }).catch(cb)
  },
  deleteBranch: cb => {

  }
})
