import chalk from 'chalk'

export default function usage (commands, err, cmd) {
  if (err) { 
    console.error(chalk.red(`${err}\n`))
  } else {
    console.error('')
  }

  if (cmd) {
    console.error(simple(cmd))
    if (cmd.usage.full) console.error(cmd.usage.full)
    else console.error('')
    process.exit(err ? 1 : 0)
  }

  console.error(`Usage: ${chalk.bold(`dweb`)} <command> ${chalk.gray(`[opts...]`)}

${chalk.bold(`General Commands:`)}

  ${simple(commands.info)}
  ${simple(commands.seed)}
  ${simple(commands.unseed)}
  ${simple(commands.create)}

  ${simple(commands.cast)}

${chalk.bold(`dDrive Commands:`)}

  ${simple(commands.driveLs)}
  ${simple(commands.driveMkdir)}
  ${simple(commands.driveRmdir)}

  ${simple(commands.driveCat)}
  ${simple(commands.drivePut)}
  ${simple(commands.driveRm)}

  ${simple(commands.driveDiff)}
  ${simple(commands.driveSync)}

  ${simple(commands.driveHttp)}

${chalk.bold(`DWebTree Commands:`)}

  ${simple(commands.dtreeLs)}
  ${simple(commands.dtreeGet)}
  ${simple(commands.dtreePut)}
  ${simple(commands.dtreeDel)}

${chalk.bold(`Daemon Commands:`)}

  ${simple(commands.daemonStatus)}
  ${simple(commands.daemonStart)}
  ${simple(commands.daemonStop)}

${chalk.bold(`Aliases:`)}

  ${chalk.bold('dweb sync')} -> dweb drive sync
  ${chalk.bold('dweb diff')} -> dweb drive diff
  ${chalk.bold('dweb ls')} -> dweb drive ls
  ${chalk.bold('dweb cat')} -> dweb drive cat
  ${chalk.bold('dweb put')} -> dweb drive put

  ${chalk.green(`Learn more at https://github.com/dwebprotocol/dhub-cli`)}
`)
  process.exit(err ? 1 : 0)
}

function simple (cmd) {
  return `${chalk.bold(`dweb ${cmd.name}`)} ${cmd.usage.simple ? `${cmd.usage.simple} -` : `-`} ${cmd.description}`
}
