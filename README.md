![./logo.png](./logo.png)

# dHub CLI

<p>[
  <a href="https://www.youtube.com/watch?v=SVk1uIQxOO8" target="_blank">Demo Video</a> |
  <a href="#installation">Installation</a> |
  <a href="#usage">Usage</a> |
  <a href="#overview">Overview</a> |
  <a href="https://hypercore-protocol.org/guides/hyp/">Website</a>
]</p>

A CLI for peer-to-peer file sharing (and more) using the [dWeb Protocol Suite](https://dwebx.org).

<a href="https://www.youtube.com/watch?v=SVk1uIQxOO8" target="_blank">📺 Watch The Demo Video</a>

## Installation

Requires nodejs 14+

```
npm install -g @dhub/cli
```

## Usage

Command overview:

```bash
Usage: dweb <command> [opts...]

General Commands:

  dweb info [urls...] - Show information about one (or more) hubs.
  dweb seed {urls...} - Download and make dweb data available to the network.
  dweb unseed {urls...} - Stop making dweb data available to the network.
  dweb create {drive|tree} - Create a new ddrive or dwebtree.

  dweb cast {pass_phrase} - Send a stream of data over the network.

dDrive Commands:

  dweb drive ls {url} - List the entries of the given dDrive URL.
  dweb drive mkdir {url} - Create a new directory at the given dDrive URL.
  dweb drive rmdir {url} - Remove a directory at the given dDrive URL.

  dweb drive cat {url} - Output the content of the given dDrive URL.
  dweb drive put {url} [content] - Write a file at the given dDrive URL.
  dweb drive rm {url} - Remove a file or (if --recursive) a folder at the given dDrive URL.

  dweb drive diff {source_path_or_url} {target_path_or_url} - Compare two folders in your local filesystem or in dDrives. Can optionally "commit" the difference.
  dweb drive sync {source_path_or_url} [target_path_or_url] - Continuously sync changes between two folders in your local filesystem or in dDrives.

  dweb drive http {url} - Host a dDrive as using HTTP on the localhost.

dWebTree Commands:

  dweb tree ls {url} - List the entries of the given dWebTree URL.
  dweb tree get {url} - Get the value of an entry of the given dWebTree URL.
  dweb tree put {url} [value] - Set the value of an entry of the given dWebTree URL.
  dweb tree del {url} - Delete an entry of the given dWebTree URL.

Daemon Commands:

  dweb daemon status - Check the status of the dHub daemon.
  dweb daemon start - Start the dHub daemon.
  dweb daemon stop - Stop the dHub and mirroring daemons if active.

Aliases:

  dweb sync -> dweb drive sync
  dweb diff -> dweb drive diff
  dweb ls -> dweb drive ls
  dweb cat -> dweb drive cat
  dweb put -> dweb drive put
```

## Overview

The [dWeb Protocol Suite](https://dwebx.org) is a peer-to-peer network for sharing files and data. This command-line provides a convenient set of tools for accessing the network.

There are two common kinds of "dDatabases":

- **dDrive** A folder containing files.
- **dWebTree** A key-value database (similar to leveldb).

All data has a URL which starts with `dweb://`. A URL will look like this:

```
dweb://515bbbc1db2139ef27b6c45dfa418c8be6a1dec16823ea7cb9e61af8d060049e/
```

You use these URLs to access the dweb data over the peer-to-peer network. For example:

```
dweb ls dweb://515bbbc1db2139ef27b6c45dfa418c8be6a1dec16823ea7cb9e61af8d060049e/
dweb cat dweb://515bbbc1db2139ef27b6c45dfa418c8be6a1dec16823ea7cb9e61af8d060049e/file.txt
cat diagram.png | dweb put 515bbbc1db2139ef27b6c45dfa418c8be6a1dec16823ea7cb9e61af8d060049e/diagram.png
```

You can create a new ddrive or dwebtree using the `create` commands:

```
dweb create drive
```

You can then seed the hyper (or seed a hyper created by somebody else) using the `seed` command:

```
dweb seed dweb://515bbbc1db2139ef27b6c45dfa418c8be6a1dec16823ea7cb9e61af8d060049e/
```

To see what hubs you are currently seeding, run `info`:

```
dweb info
```

## Documentation

The [website documentation](https://hypercore-protocol.org/guides/hyp/) have a lot of useful guides:

- [Full Commands Reference](https://hypercore-protocol.org/guides/hyp/commands/)
- [Guide: Sharing Folders](https://hypercore-protocol.org/guides/hyp/sharing-folders/)
- [Guide: Seeding Data](https://hypercore-protocol.org/guides/hyp/seeding-data/)
- [Guide: Beaming Files](https://hypercore-protocol.org/guides/hyp/beaming-files/)
