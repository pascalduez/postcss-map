# postcss-map change log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).


## [Unreleased]

## [0.9.0] - 2017-05-07
### Changed
  * PostCSS 6 upgrade.

## [0.8.0] - 2015-12-26
### Added
  * Add a `defaultMap` option as well as a default `config` map.
    ([#10](https://github.com/pascalduez/postcss-map/issues/10))

## [0.7.2] - 2015-10-29
### Fixed
  * Add filename to yaml parser for more informative error message.
  * Fix exceptions in promise.

## [0.7.1] - 2015-10-25
### Fixed
  * Update Readme examples to use PostCSS async API.

## [0.7.0] - 2015-10-24
### Changed
  * postcss-map is now fully async.
    ([#17](https://github.com/pascalduez/postcss-map/pull/17))
  * Reduced the number of AST loops.

## [0.6.0] - 2015-08-28
### Changed
  * Prevent duplicate Parser initialization.

### Added
  * Allow literal objects as map.
    ([#15](https://github.com/pascalduez/postcss-map/issues/15))

## [0.5.0] - 2015-08-27
### Changed
  * Upgrade to PostCSS 5.
  * Several development process updates.

## [0.4.1] - 2015-05-02
### Changed
  * Use standard package keyword.
    ([#319](https://github.com/postcss/postcss/issues/319))

## [0.4.0] - 2015-04-26
### Added
  * Add a new "short" syntax.
    ([#9](https://github.com/pascalduez/postcss-map/issues/9))

## [0.3.0] - 2015-04-09
## Changed
  * Allow multiple map fn calls from atRules.
    ([#8](https://github.com/pascalduez/postcss-map/issues/8))

## [0.2.0] - 2015-04-08
### Changed
  * Use latest PostCSS 4.1.* plugin API.
  * Upgrade to Babel 5.0.

## [0.1.0] - 2015-03-06
  * Initial release.


[Unreleased]: https://github.com/pascalduez/postcss-map/compare/0.8.0...HEAD
[0.8.0]: https://github.com/pascalduez/postcss-map/compare/0.7.2...0.8.0
[0.7.2]: https://github.com/pascalduez/postcss-map/compare/0.7.1...0.7.2
[0.7.1]: https://github.com/pascalduez/postcss-map/compare/0.7.0...0.7.1
[0.7.0]: https://github.com/pascalduez/postcss-map/compare/0.6.0...0.7.0
[0.6.0]: https://github.com/pascalduez/postcss-map/compare/0.5.0...0.6.0
[0.5.0]: https://github.com/pascalduez/postcss-map/compare/0.4.1...0.5.0
[0.4.1]: https://github.com/pascalduez/postcss-map/compare/0.4.0...0.4.1
[0.4.0]: https://github.com/pascalduez/postcss-map/compare/0.3.0...0.4.0
[0.3.0]: https://github.com/pascalduez/postcss-map/compare/0.2.0...0.3.0
[0.2.0]: https://github.com/pascalduez/postcss-map/compare/0.1.0...0.2.0
[0.1.0]: https://github.com/pascalduez/postcss-map/tags/0.1.0
