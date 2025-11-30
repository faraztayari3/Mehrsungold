import { data } from 'autoprefixer';
import { createChart, ColorType, CrosshairMode } from 'lightweight-charts';
import React, { useEffect, useRef } from 'react';

const ChartComponent = (props) => {
    const {
        darkMode,
        chartType,
        data,
        candleData,
        colors: {
            backgroundColor = 'transparent',
            lineColor = '#ffb31a',
            textColor = darkMode ? 'white' : 'black',
            areaTopColor = '#ffb31a',
            areaBottomColor = 'transparent',
        } = {},
    } = props;

    const chartContainerRef = useRef();

    useEffect(
        () => {
            const handleResize = () => {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }

            const chart = createChart(chartContainerRef.current, {
                layout: {
                    background: { type: ColorType.Solid, color: backgroundColor },
                    textColor,
                    fontFamily: 'iransans, tahoma',
                },
                grid: {
                    vertLines: {
                        color: darkMode ? 'rgba(255, 255, 255, 0.20)' : 'rgba(0, 0, 0, 0.20)',  // رنگ خطوط عمودی
                    },
                    horzLines: {
                        color: darkMode ? 'rgba(255, 255, 255, 0.20)' : 'rgba(0, 0, 0, 0.20)',  // رنگ خطوط افقی
                    },
                },
                crosshair: {
                    mode: chartType == 'area' ? CrosshairMode.Magnet : CrosshairMode.Normal,
                    vertLines: {
                        color: darkMode ? 'rgba(255, 255, 255, 0.90)' : 'rgba(0, 0, 0, 0.90)',  // رنگ خطوط عمودی
                    },
                    horzLines: {
                        color: darkMode ? 'rgba(255, 255, 255, 0.90)' : 'rgba(0, 0, 0, 0.90)',  // رنگ خطوط افقی
                    },
                },
                rightPriceScale: {
                    visible: false
                },
                leftPriceScale: {
                    visible: true,
                    borderColor: darkMode ? 'white' : 'black'
                },
                timeScale: {
                    // rightOffset: 12,
                    borderColor: darkMode ? 'white' : 'black'
                },
                localization: { locale: 'fa-IR', dateFormat: 'yyyy-MM-dd' },
                width: chartContainerRef.current.clientWidth,
                height: 400,
            });
            chart.timeScale().fitContent();
            let newSeries;
            let candlestickSeries;
            if (chartType == 'area') {
                newSeries = chart.addAreaSeries({ lineType: 2, lineColor, topColor: areaTopColor, bottomColor: areaBottomColor, crossHairMarkerVisible: false });
                newSeries.priceScale().applyOptions({
                    scaleMargins: {
                        // positioning the price scale for the area series
                        top: 0.1,
                        bottom: 0.4,
                    },
                });

                newSeries.setData(data);
            } else {
                candlestickSeries = chart.addCandlestickSeries({ upColor: '#26a69a', downColor: '#ef5350', borderVisible: false, wickUpColor: '#26a69a', wickDownColor: '#ef5350' });
                candlestickSeries.setData(candleData);
            }

            const toolTipWidth = 80;
            const toolTipHeight = 80;
            const toolTipMargin = 15;

            // Create and style the tooltip html element
            const toolTip = document.createElement('div');
            toolTip.style = `width: 160px; height: 80px; position: absolute; display: none; padding: 20px; box-sizing: border-box; font-size: 12px; text-align: center; z-index: 1000; top: 12px; left: 12px; pointer-events: none;border: 1px solid; border-radius: 16px; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;`;
            toolTip.style.background = darkMode ? 'rgb(0, 0, 0, 0.2)' : 'rgb(255, 255, 255, 0.2)';
            toolTip.style.borderColor = darkMode ? 'rgb(255, 255, 255, 0.2)' : 'rgb(0, 0, 0, 0.2)';
            chartContainerRef.current.appendChild(toolTip);
            if (chartType == 'area') {
                // update tooltip
                chart.subscribeCrosshairMove(param => {
                    if (
                        param.point === undefined ||
                        !param.time ||
                        param.point.x < 0 ||
                        param.point.x > chartContainerRef.current.clientWidth ||
                        param.point.y < 0 ||
                        param.point.y > chartContainerRef.current.clientHeight
                    ) {
                        toolTip.style.display = 'none';
                    } else {
                        // time will be in the same format that we supplied to setData.
                        // thus it will be YYYY-MM-DD
                        const dateStr = `${param.time?.year}-${param.time?.month}-${param.time?.day}`;
                        toolTip.style.display = 'block';
                        const data = param.seriesData.get(newSeries);
                        const price = data.value !== undefined ? data.value : data.close;
                        toolTip.innerHTML = `<div></div><div style="display:flex;flex-direction: column;align-items: center;">
                                                <span className="small-3">${dateStr}</span>
                                                <span>${Math.round(100 * price) / 100}</span>
                                        </div>`;

                        // let left = param.point.x; // relative to timeScale
                        // const timeScaleWidth = chart.timeScale().width();
                        // const priceScaleWidth = chart.priceScale('left').width();
                        // const halfTooltipWidth = toolTipWidth / 2;
                        // left += priceScaleWidth - halfTooltipWidth;
                        // left = Math.min(left, priceScaleWidth + timeScaleWidth - toolTipWidth);
                        // left = Math.max(left, priceScaleWidth);

                        // toolTip.style.left = left + 'px';
                        // toolTip.style.top = 0 + 'px';
                        const y = param.point.y;
                        let left = param.point.x + toolTipMargin;
                        if (left > chartContainerRef.current.clientWidth - toolTipWidth) {
                            left = param.point.x - toolTipMargin - toolTipWidth;
                        }

                        let top = y + toolTipMargin;
                        if (top > chartContainerRef.current.clientHeight - toolTipHeight) {
                            top = y - toolTipHeight - toolTipMargin;
                        }
                        toolTip.style.left = left + 'px';
                        toolTip.style.top = top + 'px';
                    }
                });
            }

            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);

                chart.remove();
            };
        },
        [darkMode, chartType, data, backgroundColor, lineColor, textColor, areaTopColor, areaBottomColor]
    )

    return (
        <div
            ref={chartContainerRef}
        />
    );
}

export default ChartComponent;
