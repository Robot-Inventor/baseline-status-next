# &lt;BaselineStatus> component for Next.js

<img width="859" alt="baseline_widget_example" src="https://github.com/web-platform-dx/baseline-status/assets/1914261/3171ee2d-6949-47c9-8328-b79e467813f7">

A widget displaying Baseline status of a web feature based on
https://github.com/web-platform-dx/web-features data.

This package is a port of [web-platform-dx/baseline-status](https://github.com/web-platform-dx/baseline-status) so that it can be used in Next.js server components.

## Installation

```bash
npm install @robot-inventor/baseline-status-next
```

## Usage

Show Baseline status widget for
[anchor-positioning](https://github.com/web-platform-dx/web-features/blob/main/features/anchor-positioning.yml):

```jsx
import { BaselineStatus } from "@robot-inventor/baseline-status-next";

<BaselineStatus featureId="anchor-positioning" />
```

### Props

- `featureId` (required): Feature ID from the `web-platform-dx/web-features` repository (e.g. `anchor-positioning`).
- `openInNewTab` (optional, default: `false`): When `true`, external links in the widget open in a new tab.

## Data source

The widget fetches data from the Web Features API endpoint: `https://api.webstatus.dev/v1/features/` which exposes data from the [web-platform-dx/web-features](https://github.com/web-platform-dx/web-features/) project.

Feature IDs come from the [github.com/web-platform-dx/web-features](https://github.com/web-platform-dx/web-features/tree/main/features) repo. 

Alternatively, you can find the feature ID by browsing the [webstatus.dev](https://webstatus.dev/) site and reading the ID from the URL. E.g. for `Intl.ListFormat` feature the page URL is `https://webstatus.dev/features/intl-list-format`, so the ID for this feature is `intl-list-format`.

## Copyright and license

Code is released under the [Apache License, Version 2.0](LICENSE) with the following notice:

> Copyright [baseline-status contributors](https://github.com/web-platform-dx/baseline-status/graphs/contributors)
>
> Licensed under the Apache License, Version 2.0 (the "License");
> you may not use this file except in compliance with the License.
> You may obtain a copy of the License at
>
>   http://www.apache.org/licenses/LICENSE-2.0
>
> Unless required by applicable law or agreed to in writing, software
> distributed under the License is distributed on an "AS IS" BASIS,
> WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
> See the License for the specific language governing permissions and
> limitations under the License.
