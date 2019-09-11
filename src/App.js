import React from 'react';
import './App.css';
import moment from 'moment-timezone';
import FgpGraph from '@future-grid/fgp-graph';
import { Formatters } from '@future-grid/fgp-graph/lib/extras/formatters';

/**
 * Data Services  non typescript version
 */
export class DataService {
    randomNumber = (min, max) => {
        // min and max included
        return Math.floor(Math.random() * (max - min + 1) + min);
    };

    rangeData = [];

    deviceData = [];

    constructor() {
        this.rangeData = [
            {
                id: 'meter1',
                data: {
                    first: {
                        timestamp: new Date('2019/06/01').getTime(),
                        voltage: this.randomNumber(252, 255)
                    },
                    last: {
                        timestamp: moment()
                            .add(1, 'days')
                            .startOf('day')
                            .valueOf(),
                        voltage: this.randomNumber(252, 255)
                    }
                }
            },
            {
                id: 'meter2',
                data: {
                    first: {
                        timestamp: new Date('2019/06/01').getTime(),
                        voltage: this.randomNumber(252, 255)
                    },
                    last: {
                        timestamp: moment()
                            .add(1, 'days')
                            .startOf('day')
                            .valueOf(),
                        voltage: this.randomNumber(252, 255)
                    }
                }
            },
            {
                id: 'meter3',
                data: {
                    first: {
                        timestamp: new Date('2019/06/01').getTime(),
                        voltage: this.randomNumber(252, 255)
                    },
                    last: {
                        timestamp: moment()
                            .add(1, 'days')
                            .startOf('day')
                            .valueOf(),
                        voltage: this.randomNumber(252, 255)
                    }
                }
            },
            {
                id: 'substation1',
                data: {
                    first: {
                        timestamp: new Date('2019/06/01').getTime(),
                        avgConsumptionVah: this.randomNumber(252, 255)
                    },
                    last: {
                        timestamp: moment()
                            .add(1, 'days')
                            .startOf('day')
                            .valueOf(),
                        avgConsumptionVah: this.randomNumber(252, 255)
                    }
                }
            }
        ];
    }

    fetchFirstNLast = (ids, interval, fields) => {
        return new Promise((resolve, reject) => {
            // sample data for first and last
            resolve(this.rangeData);
        });
    };

    fetchdata = (ids, interval, range, fields) => {
        let tempDate = moment(range.start)
            .startOf('day')
            .valueOf();
        let existData = [];
        ids.forEach(id => {
            let exist = this.deviceData.find(_data => {
                return _data.id === id && _data.interval === interval;
            });
            if (!exist) {
                exist = { id: id, interval: interval, data: [] };
                this.deviceData.push(exist);
            }
            existData.push(exist);
        });

        while (tempDate <= range.end) {
            // create data for different devices with correct interval
            existData.forEach(_ed => {
                if (_ed.id.indexOf('meter') !== -1) {
                    // get existing data
                    if (_ed.interval === interval) {
                        // find data
                        let recordExist = false;
                        _ed.data.forEach(_data => {
                            if (_data.timestamp === tempDate) {
                                // found it
                                recordExist = true;
                            }
                        });
                        if (!recordExist) {
                            // add new one
                            _ed.data.push({
                                timestamp: tempDate,
                                voltage: this.randomNumber(252, 255),
                                amp: this.randomNumber(1, 2),
                                avgVoltage: this.randomNumber(250, 255)
                            });
                        }
                    }
                } else if (_ed.id.indexOf('substation') !== -1) {
                    if (_ed.interval === interval) {
                        // find data
                        let recordExist = false;
                        _ed.data.forEach(_data => {
                            if (_data.timestamp === tempDate) {
                                // found it
                                recordExist = true;
                            }
                        });
                        if (!recordExist) {
                            let max = this.randomNumber(253, 255);
                            let min = this.randomNumber(250, 252);
                            let avg = Math.floor((max + min) / 2);
                            // add new one
                            _ed.data.push({
                                timestamp: tempDate,
                                avgConsumptionVah: avg,
                                maxConsumptionVah: max,
                                minConsumptionVah: min
                            });
                        }
                    }
                }
            });

            if ('substation_interval_day' === interval) {
                tempDate += 86400000;
            } else if ('substation_interval' === interval) {
                tempDate += 3600000;
            } else if ('meter_read_day' === interval) {
                tempDate += 86400000;
            } else if ('meter_read' === interval) {
                tempDate += 3600000;
            }
        }

        return new Promise((resolve, reject) => {
            let sampleData = [];
            // find data for current device and interval
            this.deviceData.forEach(_data => {
                ids.forEach(_id => {
                    if (_id === _data.id && _data.interval === interval) {
                        // found data
                        let _records = [];
                        _data.data.forEach(_d => {
                            if (
                                _d.timestamp >= range.start &&
                                _d.timestamp <= range.end
                            ) {
                                _records.push(_d);
                            }
                        });
                        sampleData.push({ id: _id, data: _records });
                    }
                });
            });
            resolve(sampleData);
        });
    };
}

class App extends React.Component {
    componentDidMount(prevProps) {
        // label, legend formatters, can overwrited by your formatters
        let formatters = new Formatters('Australia/Melbourne');

        // data provider
        let dataService = new DataService();

        // graph configuration
        let vdConfig = {
            name: 'device view',
            graphConfig: {
                features: {
                    zoom: true,
                    scroll: true,
                    rangeBar: true,
                    legend: formatters.legendForAllSeries
                },
                entities: [
                    {
                        id: 'substation1',
                        type: 'substation',
                        name: '**F**substation'
                    }
                ],
                rangeEntity: {
                    id: 'substation1',
                    type: 'substation',
                    name: '**F**substation'
                },
                rangeCollection: {
                    label: 'substation_day',
                    name: 'substation_interval_day',
                    interval: 86400000,
                    series: [
                        {
                            label: 'Avg',
                            type: 'line',
                            exp: 'data.avgConsumptionVah'
                        }
                    ]
                },
                collections: [
                    {
                        label: 'substation_raw',
                        name: 'substation_interval',
                        interval: 3600000,
                        series: [
                            {
                                label: 'Avg',
                                type: 'line',
                                exp: 'data.avgConsumptionVah',
                                yIndex: 'left',
                                color: '#058902'
                            },
                            {
                                label: 'Max',
                                type: 'line',
                                exp: 'data.maxConsumptionVah',
                                yIndex: 'left',
                                color: '#d80808'
                            },
                            {
                                label: 'Min',
                                type: 'line',
                                exp: 'data.minConsumptionVah',
                                yIndex: 'left',
                                color: '#210aa8'
                            }
                        ],
                        threshold: { min: 0, max: 1000 * 60 * 60 * 24 * 10 }, //  0 ~ 10 days
                        yLabel: 'voltage',
                        y2Label: 'voltage',
                        initScales: { left: { min: 245, max: 260 } },
                        fill: false
                    },
                    {
                        label: 'substation_day',
                        name: 'substation_interval_day',
                        interval: 86400000,
                        series: [
                            {
                                label: 'Avg',
                                type: 'line',
                                exp: 'data.avgConsumptionVah',
                                yIndex: 'left'
                            },
                            {
                                label: 'Max',
                                type: 'line',
                                exp: 'data.maxConsumptionVah',
                                yIndex: 'left'
                            },
                            {
                                label: 'Min',
                                type: 'line',
                                exp: 'data.minConsumptionVah',
                                yIndex: 'left'
                            }
                        ],
                        threshold: {
                            min: 1000 * 60 * 60 * 24 * 10,
                            max: 1000 * 60 * 60 * 24 * 7 * 52 * 10
                        }, // 7 days ~ 3 weeks
                        yLabel: 'voltage',
                        y2Label: 'voltage',
                        initScales: { left: { min: 230, max: 260 } },
                        fill: false
                    }
                ]
            },
            dataService: dataService,
            show: true,
            ranges: [
                { name: '7 days', value: 604800000, show: true },
                { name: '1 month', value: 2592000000 }
            ],
            initRange: {
                start: moment()
                    .subtract(10, 'days')
                    .startOf('day')
                    .valueOf(),
                end: moment()
                    .add(1, 'days')
                    .valueOf()
            },
            interaction: {
                callback: {
                    highlighCallback: (datetime, series, points) => {
                        // console.debug("selected series: ", series);
                        return [];
                    },
                    selectCallback: series => {
                        // console.debug("choosed series: ", series);
                    }
                }
            },
            timezone: 'Australia/Melbourne'
            // timezone: 'Pacific/Auckland'
        };

        let vsConfig = {
            name: 'scatter view',
            graphConfig: {
                features: {
                    zoom: true,
                    scroll: true,
                    rangeBar: true,
                    legend: formatters.legendForSingleSeries
                },
                entities: [
                    { id: 'meter1', type: 'meter', name: 'meter1' },
                    { id: 'meter2', type: 'meter', name: 'meter2' }
                ],
                rangeEntity: {
                    id: 'substation1',
                    type: 'substation',
                    name: '**F**substation'
                },
                rangeCollection: {
                    label: 'substation_day',
                    name: 'substation_interval_day',
                    interval: 86400000,
                    series: [
                        {
                            label: 'Avg',
                            type: 'line',
                            exp: 'data.avgConsumptionVah'
                        }
                    ]
                },
                collections: [
                    {
                        label: 'meter_raw',
                        name: 'meter_read',
                        interval: 3600000,
                        series: [
                            {
                                label: 'Voltage',
                                type: 'line',
                                exp: 'data.voltage',
                                yIndex: 'left'
                            }
                        ],
                        threshold: { min: 0, max: 1000 * 60 * 60 * 24 * 10 }, //  0 ~ 10 days
                        initScales: { left: { min: 245, max: 260 } },
                        yLabel: 'voltage'
                    },
                    {
                        label: 'meter_day',
                        name: 'meter_read_day',
                        interval: 86400000,
                        series: [
                            {
                                label: 'Avg Voltage',
                                type: 'line',
                                exp: 'data.avgVoltage',
                                yIndex: 'left'
                            }
                        ],
                        threshold: {
                            min: 1000 * 60 * 60 * 24 * 10,
                            max: 1000 * 60 * 60 * 24 * 7 * 52 * 10
                        }, // 7 days ~ 3 weeks
                        initScales: { left: { min: 245, max: 260 } },
                        yLabel: 'voltage'
                    }
                ]
            },
            dataService: dataService,
            show: false,
            ranges: [
                { name: '7 days', value: 604800000, show: true },
                { name: '1 month', value: 2592000000 }
            ],
            initRange: {
                start: moment()
                    .subtract(10, 'days')
                    .startOf('day')
                    .valueOf(),
                end: moment()
                    .add(1, 'days')
                    .valueOf()
            },
            interaction: {
                callback: {
                    highlighCallback: (datetime, series, points) => {
                        // console.debug("selected series: ", series);
                        return [];
                    },
                    selectCallback: series => {
                        // console.debug("choosed series: ", series);
                    }
                }
            },
            timezone: 'Australia/Melbourne'
            // timezone: 'Pacific/Auckland'
        };

        let vsConfig2 = {
            name: 'scatter view',
            graphConfig: {
                features: {
                    zoom: true,
                    scroll: false,
                    rangeBar: false,
                    legend: formatters.legendForSingleSeries
                },
                entities: [
                    { id: 'meter1', type: 'meter', name: 'meter1' },
                    { id: 'meter2', type: 'meter', name: 'meter2' }
                ],
                rangeEntity: {
                    id: 'substation1',
                    type: 'substation',
                    name: '**F**substation'
                },
                rangeCollection: {
                    label: 'substation_day',
                    name: 'substation_interval_day',
                    interval: 86400000,
                    series: [
                        {
                            label: 'Avg',
                            type: 'line',
                            exp: 'data.avgConsumptionVah'
                        }
                    ]
                },
                collections: [
                    {
                        label: 'meter_raw',
                        name: 'meter_read',
                        interval: 3600000,
                        series: [
                            {
                                label: 'Voltage',
                                type: 'line',
                                exp: 'data.voltage',
                                yIndex: 'left'
                            }
                        ],
                        threshold: { min: 0, max: 1000 * 60 * 60 * 24 * 10 }, //  0 ~ 10 days
                        initScales: { left: { min: 245, max: 260 } },
                        yLabel: 'voltage'
                    },
                    {
                        label: 'meter_day',
                        name: 'meter_read_day',
                        interval: 86400000,
                        series: [
                            {
                                label: 'Avg Voltage',
                                type: 'line',
                                exp: 'data.avgVoltage',
                                yIndex: 'left'
                            }
                        ],
                        threshold: {
                            min: 1000 * 60 * 60 * 24 * 10,
                            max: 1000 * 60 * 60 * 24 * 7 * 52 * 10
                        }, // 7 days ~ 3 weeks
                        initScales: { left: { min: 245, max: 260 } },
                        yLabel: 'voltage'
                    }
                ]
            },
            dataService: dataService,
            show: true,
            ranges: [
                { name: '7 days', value: 604800000, show: true },
                { name: '1 month', value: 2592000000 }
            ],
            initRange: {
                start: moment()
                    .subtract(10, 'days')
                    .startOf('day')
                    .valueOf(),
                end: moment()
                    .add(1, 'days')
                    .valueOf()
            },
            interaction: {
                callback: {
                    highlighCallback: (datetime, series, points) => {
                        // console.debug("selected series: ", series);
                        return [];
                    },
                    selectCallback: series => {
                        // console.debug("choosed series: ", series);
                    }
                }
            },
            timezone: 'Australia/Melbourne'
            // timezone: 'Pacific/Auckland'
        };
        let vsConfig3 = {
            name: 'scatter view',
            graphConfig: {
                features: {
                    zoom: true,
                    scroll: false,
                    rangeBar: false,
                    legend: formatters.legendForSingleSeries
                },
                entities: [
                    { id: 'meter1', type: 'meter', name: 'meter1' },
                    { id: 'meter2', type: 'meter', name: 'meter2' }
                ],
                rangeEntity: {
                    id: 'substation1',
                    type: 'substation',
                    name: '**F**substation'
                },
                rangeCollection: {
                    label: 'substation_day',
                    name: 'substation_interval_day',
                    interval: 86400000,
                    series: [
                        {
                            label: 'Avg',
                            type: 'line',
                            exp: 'data.avgConsumptionVah'
                        }
                    ]
                },
                collections: [
                    {
                        label: 'meter_raw',
                        name: 'meter_read',
                        interval: 3600000,
                        series: [
                            {
                                label: 'Voltage',
                                type: 'line',
                                exp: 'data.voltage',
                                yIndex: 'left'
                            }
                        ],
                        threshold: { min: 0, max: 1000 * 60 * 60 * 24 * 10 }, //  0 ~ 10 days
                        initScales: { left: { min: 245, max: 260 } },
                        yLabel: 'voltage'
                    },
                    {
                        label: 'meter_day',
                        name: 'meter_read_day',
                        interval: 86400000,
                        series: [
                            {
                                label: 'Avg Voltage',
                                type: 'line',
                                exp: 'data.avgVoltage',
                                yIndex: 'left'
                            }
                        ],
                        threshold: {
                            min: 1000 * 60 * 60 * 24 * 10,
                            max: 1000 * 60 * 60 * 24 * 7 * 52 * 10
                        }, // 7 days ~ 3 weeks
                        initScales: { left: { min: 245, max: 260 } },
                        yLabel: 'voltage'
                    }
                ]
            },
            dataService: dataService,
            show: true,
            ranges: [
                { name: '7 days', value: 604800000, show: true },
                { name: '1 month', value: 2592000000 }
            ],
            initRange: {
                start: moment()
                    .subtract(10, 'days')
                    .startOf('day')
                    .valueOf(),
                end: moment()
                    .add(1, 'days')
                    .valueOf()
            },
            interaction: {
                callback: {
                    highlighCallback: (datetime, series, points) => {
                        // console.debug("selected series: ", series);
                        return [];
                    },
                    selectCallback: series => {
                        // console.debug("choosed series: ", series);
                    }
                }
            },
            timezone: 'Australia/Melbourne'
            // timezone: 'Pacific/Auckland'
        };

        // graphs
        let graph3 = new FgpGraph(document.getElementById('graph3'), [
            vsConfig3
        ]);
        graph3.initGraph();

        let graph2 = new FgpGraph(document.getElementById('graph2'), [
            vsConfig2
        ]);
        graph2.initGraph();

        let graph1 = new FgpGraph(document.getElementById('graph1'), [
            vdConfig,
            vsConfig
        ]);
        // render graph
        graph1.initGraph();

        // link graphs
        graph1.setChildren([graph2, graph3]);

        graph2.setChildren([graph1]); // problem with right and left axis
    }

    render() {
        // height required!
        var graphContiner = {
            height: '300px', 
            padding: '10px'
        };

        return (
            <div className="App">
                <div
                    className={'container-fluid'}
                    id="graph1"
                    style={graphContiner}
                ></div>
                <div
                    className={'container-fluid'}
                    id="graph2"
                    style={graphContiner}
                ></div>
                <div
                    className={'container-fluid'}
                    id="graph3"
                    style={graphContiner}
                ></div>
            </div>
        );
    }
}

export default App;
