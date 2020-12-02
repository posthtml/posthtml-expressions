## [1.7.1](https://github.com/posthtml/posthtml-expressions/compare/v1.7.0...v1.7.1) (2020-12-02)


### Bug Fixes

* throw if strict mode ([2c0c0d1](https://github.com/posthtml/posthtml-expressions/commit/2c0c0d1a181b280ba72f76c6530a1c626ab987e6))



# [1.7.0](https://github.com/posthtml/posthtml-expressions/compare/v1.6.2...v1.7.0) (2020-11-24)



## [1.6.2](https://github.com/posthtml/posthtml-expressions/compare/v1.6.1...v1.6.2) (2020-11-12)


### Bug Fixes

* items is not defined in each, close [#107](https://github.com/posthtml/posthtml-expressions/issues/107) ([d14fbbb](https://github.com/posthtml/posthtml-expressions/commit/d14fbbb683460fad4f8b2edb649f9ef759b89038))



## [1.6.1](https://github.com/posthtml/posthtml-expressions/compare/v1.6.0...v1.6.1) (2020-11-09)


### Bug Fixes

* check if key exists in locals as text, close [#102](https://github.com/posthtml/posthtml-expressions/issues/102) ([1d7596a](https://github.com/posthtml/posthtml-expressions/commit/1d7596a8a4d12fd29a74f03637057772a9b81d09))



# [1.6.0](https://github.com/posthtml/posthtml-expressions/compare/v1.5.0...v1.6.0) (2020-10-30)


### Features

* strictMode show or not throw an exception, close [#102](https://github.com/posthtml/posthtml-expressions/issues/102) ([dbb32c9](https://github.com/posthtml/posthtml-expressions/commit/dbb32c9a9cd0c3b6468547ecea1d1d492e0ac7ce))



# [1.5.0](https://github.com/posthtml/posthtml-expressions/compare/v1.4.7...v1.5.0) (2020-09-21)


### Features

* attribute as param, close [#99](https://github.com/posthtml/posthtml-expressions/issues/99) ([74c2b32](https://github.com/posthtml/posthtml-expressions/commit/74c2b3201f1492c4115e0e4b8f71e228f0e70370))



## [1.4.7](https://github.com/posthtml/posthtml-expressions/compare/v1.4.6...v1.4.7) (2020-08-28)


### Bug Fixes

* options for parser when nnormalize, close [#97](https://github.com/posthtml/posthtml-expressions/issues/97) ([99c0281](https://github.com/posthtml/posthtml-expressions/commit/99c02815facfcb692d52f37b3d80ad882f4756fb))



## [1.4.6](https://github.com/posthtml/posthtml-expressions/compare/v1.4.5...v1.4.6) (2020-08-23)


### Bug Fixes

* remove node text after condition, close [#62](https://github.com/posthtml/posthtml-expressions/issues/62) ([2cefe7d](https://github.com/posthtml/posthtml-expressions/commit/2cefe7dac40b61e82752c7f03b91296870474194))



## [1.4.5](https://github.com/posthtml/posthtml-expressions/compare/v1.4.4...v1.4.5) (2020-07-07)


### Bug Fixes

* normalize output tree, close [#93](https://github.com/posthtml/posthtml-expressions/issues/93) ([5d820e5](https://github.com/posthtml/posthtml-expressions/commit/5d820e59e0f745444015220937d3e3321071249e))



## [1.4.4](https://github.com/posthtml/posthtml-expressions/compare/v1.4.3...v1.4.4) (2020-06-30)


### Bug Fixes

* escape custom delimiters when ignoring expressions ([53c901e](https://github.com/posthtml/posthtml-expressions/commit/53c901eb8d58e4c1d259db9963bd6817efc11ea2))



## [1.4.3](https://github.com/posthtml/posthtml-expressions/compare/v1.4.2...v1.4.3) (2020-06-25)


### Bug Fixes

* clear raw tag after expression, close [#82](https://github.com/posthtml/posthtml-expressions/issues/82) ([2aaef58](https://github.com/posthtml/posthtml-expressions/commit/2aaef5867c0f7971358226f125b288e9de4d021c))



<a name="1.1.0"></a>
# [1.1.0](https://github.com/posthtml/posthtml-expressions/compare/v1.0.0...v1.1.0) (2016-12-14)


### Bug Fixes

* **index:** comments ([553b0fa](https://github.com/posthtml/posthtml-expressions/commit/553b0fa))
* **index:** copy/paste for loops ([c865969](https://github.com/posthtml/posthtml-expressions/commit/c865969))

### Features

* **index:** add switch statement ([88058d1](https://github.com/posthtml/posthtml-expressions/commit/88058d1))



<a name="1.0.0"></a>
# [1.0.0](https://github.com/posthtml/posthtml-expressions/compare/v0.9.0...v1.0.0) (2016-11-19)


### Bug Fixes

* patch to fix expressions in else/elseif blocks ([f50c36f](https://github.com/posthtml/posthtml-expressions/commit/f50c36f))
* **index:** Fix issue with conditional in loops ([58b1f50](https://github.com/posthtml/posthtml-expressions/commit/58b1f50))
* **index:** remove console.log, fix comment ([c5b7887](https://github.com/posthtml/posthtml-expressions/commit/c5b7887))
* **lib:** add missing 'use strict' statement ([4078c90](https://github.com/posthtml/posthtml-expressions/commit/4078c90))
* **placeholders:** Fix typo in "matches" ([e0d38bd](https://github.com/posthtml/posthtml-expressions/commit/e0d38bd))

### Features

* **index:** scopes ([d3ea9ce](https://github.com/posthtml/posthtml-expressions/commit/d3ea9ce))

### Performance Improvements

* **index:** Create a copy only for specified keys ([5239bc0](https://github.com/posthtml/posthtml-expressions/commit/5239bc0))
* **index:** Make a copy of the tree only once ([ba9d706](https://github.com/posthtml/posthtml-expressions/commit/ba9d706))
* **index:** Optimize scoped locals for `scope` tag ([1046bc4](https://github.com/posthtml/posthtml-expressions/commit/1046bc4))
