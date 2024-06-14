# [Linear.app](https://linear.app.com/) Plugin for [Moon Jot](moonjot.com)

<span class="badge-npmversion"><a href="https://npmjs.org/package/@moonjot/moon-linear-plugin" title="View this project on NPM"><img src="https://img.shields.io/npm/v/@moonjot/moon-linear-plugin.svg" alt="NPM version" /></a></span>
<span class="badge-npmdownloads"><a href="https://npmjs.org/package/@moonjot/moon-linear-plugin" title="View this project on NPM"><img src="https://img.shields.io/npm/dm/@moonjot/moon-linear-plugin.svg" alt="NPM downloads" /></a></span>

Send Note from your OS to [Linear.app](https://linear.app/) with your current context. Make it faster to capture into Linear.app.

Get Linear.app token

Go to settings

![](./settings.png)

Go to Api and integration

![](./api.png)

Go to key

![](./key.png)

Generate you key and past it into Settings

## Automatic tags

You can auto-generate tags by adding the path to the context object property separated by ','. Refer to the provided documentation that explains 'context object' such as 'source.type, source.location'. [Documentation](https://github.com/castroCrea/moon/blob/b35e939b7b137871896f2c61413045153d3c4310/src/FetchContext.type.ts#L52-L53).

## TODO

- [ ] Add template
- [ ] Add preset values

## Template

```
{{content}}

{{IF source.url}}
# {{IF source.name}}{{source.name}}{{END_IF source.name}}
{{IF source.url}}{{source.url}}{{END_IF source.url}}
{{IF source.description}}{{source.description}}{{END_IF source.description}}
{{IF source.timestamp}}
## Timestamps
- [{{source.timestamp.0.timestamp}}]({{source.timestamp.0.url}})
{{END_IF source.timestamp}}
{{END_IF source.url}}

{{IF people.0.name}}
# {{IF people.0.name}}{{people.0.name}}{{END_IF people.0.name}}
{{IF people.0.job}}{{people.0.job}}{{END_IF people.0.job}}
{{IF people.0.email}}[{{people.0.email}}](mailto:{{people.0.email}}){{END_IF people.0.email}}
{{IF people.0.about}}{{people.0.about}}{{END_IF people.0.about}}
{{IF people.0.linkedin}}linkedin : [{{people.0.linkedin}}]({{END_IF people.0.linkedin}}){{END_IF people.0.linkedin}}
{{IF people.0.twitter}}twitter : [{{people.0.twitter}}]({{END_IF people.0.twitter}}){{END_IF people.0.twitter}}
{{IF people.0.tiktok}}tiktok : [{{people.0.tiktok}}]({{END_IF people.0.tiktok}}){{END_IF people.0.tiktok}}
{{IF people.0.instagram}}instagram : [{{people.0.instagram}}]({{END_IF people.0.instagram}}){{END_IF people.0.instagram}}
{{IF people.0.substack}}substack : [{{people.0.substack}}]({{END_IF people.0.substack}}){{END_IF people.0.substack}}
{{IF people.0.github}}github : [{{people.0.github}}]({{END_IF people.0.github}}){{END_IF people.0.github}}
{{IF people.0.mastodon}}mastodon : [{{people.0.mastodon}}]({{END_IF people.0.mastodon}}){{END_IF people.0.mastodon}}
{{IF people.0.youtube}}youtube : [{{people.0.youtube}}]({{END_IF people.0.youtube}}){{END_IF people.0.youtube}}
{{IF people.0.website}}website : [{{people.0.website}}]({{END_IF people.0.website}}){{END_IF people.0.website}}
{{END_IF people.0}}
```


## Condition

### Is defined

You can insert content based on a condition.
Currently, the condition only checks if something exists or does not exist.
```
{{IF ...}}Write something{{END_IF ...}}

// Example:
{{IF author}}Author: {{author}}{{END_IF author}}
```

### You can also do some condition with equality

#### === undefined
```
{{IF author === undefined}}content{{END_IF author}}
```

#### === some text
```
{{IF content === some text}}content{{END_IF content}}
```

#### !== some text
```
{{IF content !== some text}}content{{END_IF content}}{{IF content !== some text hey }}content different{{END_IF content}}
```

#### .includes(something)
```
{{IF content.includes(some t)}}content{{END_IF content}}{{IF content.includes(some text hey) }}content different{{END_IF content}}
```

#### .startsWith(something)
```
{{IF SOURCE.TEXT.startsWith(- [ ])}}content{{END_IF SOURCE.TEXT}}
```

## Date

You can format the date as YYYY-MM-DD HH:mm:ss.
```
{{DATE}}YYYY-MM-DD{{END_DATE}}
{{DATE}}HH:mm{{END_DATE}}
```

## Installation

```bash
yarn
```

## Build before publishing

```bash
yarn build
```

## For dev mode run 

```bash
yarn watch
```

## Publishing

First remove current git origin
```bash
git remote remove origin
```

Add you repo origin and change also **credential** iin `package.json`

Then
```bash
yarn pub
```