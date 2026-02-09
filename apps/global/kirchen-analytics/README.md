# Kirchenklima Analytics

Modern dashboard for church climate analysis (EDS), replacing the previous Power BI setup. Built with Vite, React, TypeScript, Apache ECharts, and Leaflet.

## Features

- **Time range selection**: Date picker, range slider, presets (7 days, 1 month, 1 year)
- **Filters**: Object tree (expandable hierarchy), measuring points per object, parameters (API + calculated)
- **KPIs**: Min, max, mean, median from current time series
- **Charts**: Time series (ECharts) with data zoom, toolbox, reference lines; multi-parameter view with dual Y-axis
- **Map**: Leaflet map with church/object markers
- **Calculated parameters**: Dew point, saturation pressure, absolute humidity, wet-bulb temperature, aw-value (from temperature + relative humidity)

## Tech stack

- Vite, React 19, TypeScript
- Apache ECharts (`echarts-for-react`), Leaflet (`react-leaflet`)
- Tailwind CSS 4, Zustand, `react-datepicker`
- `@project/api-client` for LineMetrics API

## Development

```bash
# From repo root
npm run dev --workspace=kirchen-analytics
```

## Build

```bash
npm run build --workspace=kirchen-analytics
```

Output: `build/global/kirchen-analytics/`

## Configuration

- Runtime: `config.js` (loaded from `../../config.js`; injected in Docker).
- Local: `.env` with `REACT_APP_BASE_URL`, `REACT_APP_CLIENT_ID`, `REACT_APP_CLIENT_SECRET`.
- Token: optional `?token=...` URL parameter for auth.
