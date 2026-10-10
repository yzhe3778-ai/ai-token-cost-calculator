# AI Token Cost Calculator

A dependency-free, local calculator for API token charges. Enter your own rates; it accounts for uncached input, cached input reads, output and an explicit multiplier for repeated identical usage. It does not fetch vendor prices, request API keys, send your inputs, or convert currencies.

The project is a small companion to the [AI Price Spy API cost guide](https://aipricespy.com/en/services/guides/billing-basics). It can be used independently of the website.

## Use in a browser

Serve this directory with any static web server, then open `index.html`. Browser modules require an HTTP origin, so use a static server instead of opening the file directly. For example, with Python installed:

```sh
python3 -m http.server --bind 127.0.0.1 8000
```

Open the local address shown by the server. You can also host `index.html` and `calculator.js` together on any static website. No build or package installation is required. The UI supports English and Chinese.

The calculator makes no external requests while calculating. Hosting services may process ordinary page requests under their own policies. Outbound guide links navigate to AI Price Spy when selected.

## Use as a module

```js
import { calculateCost } from './calculator.js';

// These rates are fictional teaching inputs, not official model prices.
const result = calculateCost({
  inputTokens: 1_000_000,       // Total input, including cached input
  cachedInputTokens: 400_000,  // Subset of total input
  outputTokens: 200_000,
  inputRate: 2,               // Currency units per million tokens
  cachedInputRate: 0.5,
  outputRate: 10,
  attemptMultiplier: 1,
  currency: 'USD',
});
console.log(result.estimatedCost); // 3.4 USD
```

```text
base = [(input − cached input) × input rate
        + cached input × cache-read rate
        + output × output rate] / 1,000,000
estimate = base × attempt multiplier
```

Use a rate per **one million** tokens for each component. Multiply a per-1K-token rate by 1,000 first. All rates must have the same currency and compatible conditions. A currency label never changes the numerical rates.

Input here is a **normalized total of ordinary input plus cache-read tokens**, excluding separately billed cache-write tokens. API usage fields differ between providers: do not paste a raw `input_tokens` field without checking its meaning. Combine or subtract the appropriate categories first. Cache-write costs must be calculated separately and must not also be charged as ordinary input in this tool.

Cached tokens must not exceed this normalized input total. An explicit cache-read rate is required if cached tokens are present; the tool does not assume caching is free. Counts must be whole numbers from 0 to 1 trillion. Rates must be finite and nonnegative. The multiplier is from 1 to 1,000; fractional values model an average scenario. Invalid input throws a descriptive error. Result values use JavaScript floating-point arithmetic and are estimates, not invoice precision.

The multiplier assumes repeated requests have identical input, output and caching. If that is untrue, calculate the actual requests separately. Taxes, subscriptions, storage, cache creation, tools, image/audio units, discounts, minimum charges and exchange rates are excluded. Use actual billed tokens for reasoning models rather than visible answer length.

## Test

Requires a supported Node.js release with the built-in test runner; Node.js 22 or later is suitable.

```sh
node --test
```

No third-party dependencies, telemetry, cookies or persisted form values are used. No live price dataset is included. Documentation prepared on 2026-10-10; MIT licensed.

## 中文说明

这是一个可独立使用的 Token 费用计算器，输入服务商单价，分别计算普通输入、缓存读取、输出和重复请求场景。无需账号或 API Key，不会传输或保存输入，没有统计追踪。它不获取实时价格，也不进行币种换算。

浏览器版支持中文和英文。使用静态服务器打开 `index.html`，或把它与 `calculator.js` 放在同一静态网站；没有构建或安装依赖步骤。模块用法与测试命令见上文。

**示例中的 2、10、0.5 都是教学假设，不是任何模型的官方报价。**本工具的输入总量指普通输入与缓存读取之和，不含另行计费的缓存写入；不同 API 用量字段口径不同，先归一分类再填写。缓存数量大于 0 时必须填写缓存读取价格。所有单价都按同一币种的每百万 Token 输入；每千 Token 单价要先乘以 1,000。

请求倍率 1 表示不重复，1.5 表示假设增加 50% 相同用量；这是场景参数，不是实测重试率。重试内容或缓存条件不同时，应按实际请求分别核算。税费、订阅、缓存写入、存储、工具调用、图片音频等费用需要另算，结果不能代替账单。

计算口径与完整算例：[AI Price Spy：算清 API 实际成本](https://aipricespy.com/zh-CN/services/guides/billing-basics)。数据来源原则：[AI Price Spy 方法说明](https://aipricespy.com/methodology)。
