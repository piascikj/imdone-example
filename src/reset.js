require('dotenv').config()
const ghGot = require('gh-got')
const token = process.env.TOKEN
const shell = require('shelljs')

function logExec (cmd, code, stdout, stderr) {
  console.log(cmd)
  console.log('--------------------------------------')
  console.log('Exit code:', code)
  console.log('Program output:', stdout)
  console.log('Program stderr:', stderr)
}

function exec (name, cmd, cb) {
  shell.exec(cmd, {silent:true}, (code, stdout, stderr) => {
    logExec(cmd, code, stderr, stdout)
    if (code !== 0) return cb(new Error(`${name} error: ${stderr}`))
    cb(null, stdout)
  })
}

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
    exec('delete remote branch', 'git push origin --delete imdone-todo-updates', cb)
  },
  resetToBaseVersion: cb => {
    exec('reset to base version 1.0', 'git reset --hard 6310a3e446539dc3b3bc73ec42696f7830602577', cb)
  },
  pushToGitHub: cb => {
    exec('push to github', 'git push -f origin master', cb)
  }
}, (err, result) => {
  if (err) return console.log(err)
  console.log(result)
})
