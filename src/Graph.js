/**
 * Graph.js
 *
 * Each graph type is a sub-class of the common Graph class.
 */

/**
 * Some utilities for plotting functions in JSXGraph.
 *
 * Based on:
 *
 *   http://jsxgraph.uni-bayreuth.de/wiki/index.php/Simple_function_plotter
 *
 */
let functionUtils = {};

// Macro function plotter
functionUtils.addCurve = function(board, func, atts) {
    var f = board.create('functiongraph', [func], atts);
    return f;
};

// Simplified plotting of function
functionUtils.plot = function(board, func, atts) {
    if (!atts) {
        return functionUtils.addCurve(board, func, {strokewidth: 2});
    } else {
        return functionUtils.addCurve(board, func, atts);
    }
};

let applyDefaults = function(obj, defaults) {
    let o = {};
    for (var key in obj) {
        if (typeof obj[key] === 'undefined') {
            o[key] = defaults[key];
        } else {
            o[key] = obj[key];
        }
    }
    return o;
};

class Graph {
    constructor(board, options, defaults) {
        if (typeof defaults === 'undefined') {
            defaults = {
                gShowIntersection: true,
                gLine1Label1: '',
                gLine1Label2: '',
                gLine1Slope: -1,
                gLine2Slope: 1,
                gLine1Offset: 0,
                gLine2Offset: 0,
                isSubmitted: false,
                l1SubmissionOffset: 0,
                l2SubmissionOffset: 0
            };
        }

        if (typeof options === 'undefined') {
            options = {};
        }

        // Line 1 and line 2
        this.l1 = null;
        this.l2 = null;

        this.options = applyDefaults(options, defaults);

        this.board = board;
    }
    /**
     * Handle common initialization that happens after the custom
     * make() step.
     */
    postMake() {
        // Make two white lines to block the curves from displaying
        // below 0. A more straightforward way to do this would be
        // better.
        this.board.create('line', [[-0.2, 0], [-0.2, 5]], {
            dash: 0,
            highlight: false,
            fixed: true,
            strokeColor: 'white',
            strokeWidth: this.board.canvasWidth / 27,
            straightFirst: true,
            straightLast: true
        });
        this.board.create('line', [[0, -0.2], [5, -0.2]], {
            dash: 0,
            highlight: false,
            fixed: true,
            strokeColor: 'white',
            strokeWidth: this.board.canvasWidth / 27,
            straightFirst: true,
            straightLast: true
        });

        const me = this;

        if (
            this.l1 && (typeof this.l1.getRise === 'function') &&
                !this.options.isSubmitted
        ) {
            this.initialL1Y = this.l1.getRise();

            this.l1.on('mouseup', function() {
                const offset = Math.round(me.l1.getRise() - me.initialL1Y);
                let offsetEvt = new CustomEvent('l1offset', {
                    detail: offset
                });
                document.dispatchEvent(offsetEvt);

                if (this.getRise() > me.initialL1Y) {
                    document.dispatchEvent(new Event('l1up'));
                } else if (this.getRise() < me.initialL1Y) {
                    document.dispatchEvent(new Event('l1down'));
                } else {
                    document.dispatchEvent(new Event('l1initial'));
                }
            });
        }

        if (
            this.l2 && (typeof this.l2.getRise === 'function') &&
                !this.options.isSubmitted
        ) {
            this.initialL2Y = this.l2.getRise();

            this.l2.on('mouseup', function() {
                const offset = Math.round(me.l2.getRise() - me.initialL2Y);
                let offsetEvt = new CustomEvent('l2offset', {
                    detail: offset
                });
                document.dispatchEvent(offsetEvt);

                if (this.getRise() > me.initialL2Y) {
                    document.dispatchEvent(new Event('l2up'));
                } else if (this.getRise() < me.initialL2Y) {
                    document.dispatchEvent(new Event('l2down'));
                } else {
                    document.dispatchEvent(new Event('l2initial'));
                }
            });
        }
    }
    /**
     * Updates the intersection point at this.i.
     *
     * Expects this.i and this.p1, this.p2 to be set.
     */
    updateIntersection() {
        this.p1.moveTo([0, this.i.Y()]);
        this.p2.moveTo([this.i.X(), 0]);
    }
    /**
     * Set up intersection display for l1 and l2.
     *
     * Sets this.i, this.p1, and this.p2.
     */
    showIntersection(l1, l2) {
        let i = this.board.create('intersection', [l1, l2, 0], {
            name: this.options.intersectLabel || '',
            fixed: true,
            showInfobox: false
        });
        this.i = i;

        let p1 = this.board.create('point', [0, i.Y()], {
            size: 0,
            name: this.options.yIntersectLabel || '',
            fixed: true,
            showInfobox: false
        });
        this.p1 = p1;
        this.board.create('line', [p1, i], {
            dash: 1,
            strokeColor: 'black',
            strokeWidth: 1,
            straightFirst: false,
            straightLast: false
        });

        let p2 = this.board.create('point', [i.X(), 0], {
            size: 0,
            name: this.options.xIntersectLabel || '',
            fixed: true,
            showInfobox: false
        });
        this.p2 = p2;
        this.board.create('line', [p2, i], {
            dash: 1,
            strokeColor: 'black',
            strokeWidth: 1,
            straightFirst: false,
            straightLast: false
        });

        // Keep the dashed intersection lines perpendicular to the axes.
        const me = this;
        l1.on('up', function() {
            me.updateIntersection();
        });
        l1.on('drag', function() {
            me.updateIntersection();
        });
        l2.on('up', function() {
            me.updateIntersection();
        });
        l2.on('drag', function() {
            me.updateIntersection();
        });
    }
    make() {
        // unimplemented
    }
}

class DemandSupplyGraph extends Graph {
    make() {
        this.l1 = this.board.create(
            'line',
            [
                [2.5, 2.5 + this.options.gLine1Offset +
                 this.options.l1SubmissionOffset],
                [3.5, 2.5 + this.options.gLine1Offset +
                 this.options.gLine1Slope + this.options.l1SubmissionOffset]
            ], {
                name: this.options.gLine1Label,
                withLabel: true,
                label: { position: 'rt', offset: [-10, -20] },
                strokeColor: 'rgb(255, 127, 14)',
                strokeWidth: 2,
                snapToGrid: true,
                fixed: this.options.isSubmitted
            });

        this.l2 = this.board.create(
            'line',
            [
                [2.5, 2.5 + this.options.gLine2Offset +
                 this.options.l2SubmissionOffset],
                [3.5, 2.5 + this.options.gLine2Offset +
                 this.options.gLine2Slope + this.options.l2SubmissionOffset]
            ], {
                name: this.options.gLine2Label,
                withLabel: true,
                label: { position: 'rt', offset: [0, 20] },
                strokeColor: 'steelblue',
                strokeWidth: 2,
                snapToGrid: true,
                fixed: this.options.isSubmitted
            });

        if (this.options.gShowIntersection) {
            this.showIntersection(this.l1, this.l2);
        }
    }
}

let mkDemandSupply = function(board, options) {
    let g = new DemandSupplyGraph(board, options);
    g.make();
    g.postMake();
    return g;
};

class LaborMarketGraph extends Graph {
    make() {
        let f = function(x) {
            return 1 / x;
        };

        this.l1 = functionUtils.plot(this.board, f, {
            name: this.options.gLine1Label,
            withLabel: true,
            strokeWidth: 2,
            strokeColor: 'rgb(255, 127, 14)'
        });

        this.l2 = this.board.create('line', [
            [0, 0 + this.options.gLine2Offset],
            [5, 5 + this.options.gLine2Offset]
        ], {
            name: this.options.gLine2Label,
            withLabel: true,
            label: { position: 'rt', offset: [10, -20] },
            strokeColor: 'steelblue',
            strokeWidth: 2,
            snapToGrid: true,
            fixed: this.options.isSubmitted
        });

        if (this.options.gShowIntersection) {
            this.showIntersection(this.l1, this.l2);
        }
    }
}

let mkLaborMarket = function(board, options) {
    let g = new LaborMarketGraph(board, options);
    g.make();
    g.postMake();
    return g;
};

class LaborMarketPerfectlyInelasticGraph extends Graph {
    make() {
        let f = function(x) {
            return 1 / x;
        };

        this.l1 = functionUtils.plot(this.board, f, {
            name: this.options.gLine1Label,
            withLabel: true,
            strokeWidth: 2,
            strokeColor: 'rgb(255, 127, 14)'
        });

        this.l2 = this.board.create(
            'line',
            [
                [2.5, 2.5 + this.options.gLine2Offset +
                 this.options.l2SubmissionOffset],
                [3.5, 2.5 + this.options.gLine2Offset +
                 this.options.gLine2Slope + this.options.l2SubmissionOffset]
            ], {
                name: this.options.gLine2Label,
                withLabel: true,
                strokeColor: 'steelblue',
                strokeWidth: 2,
                snapToGrid: true,
                fixed: this.options.isSubmitted
            });
    }
}

let mkLaborMarketPerfectlyInelastic = function(board, options) {
    let g = new LaborMarketPerfectlyInelasticGraph(board, options);
    g.make();
    g.postMake();
    return g;
};

class CobbDouglasGraph extends Graph {
    make() {
        let f = function(x) {
            return 2.01 * ((x ** 0.75) * (x ** -0.25));
        };

        functionUtils.plot(this.board, f, {
            name: this.options.gLine1Label,
            withLabel: true,
            strokeWidth: 2,
            strokeColor: 'steelBlue'
        });
    }
}

let mkCobbDouglas = function(board, options) {
    let g = new CobbDouglasGraph(board, options);
    g.make();
    g.postMake();
    return g;
};

class LaborSupplyGraph extends Graph {
    make() {
        this.l1 = this.board.create(
            'line', [
                [0, 5 + this.options.gLine1Offset +
                 this.options.l1SubmissionOffset],
                [5, 0 + this.options.gLine1Offset +
                 this.options.l1SubmissionOffset]
            ], {
                name: this.options.gLine1Label,
                withLabel: true,
                label: { position: 'rt', offset: [-10, 20] },
                strokeColor: 'rgb(255, 127, 14)',
                strokeWidth: 2,
                fixed: this.options.isSubmitted
            });
    }
}

let mkLaborSupply = function(board, options) {
    let g = new LaborSupplyGraph(board, options);
    g.make();
    g.postMake();
    return g;
};

class ConsumptionSavingGraph extends Graph {
    make() {
        this.board.create(
            'line', [
                [0, 5 + this.options.gLine1Offset +
                 this.options.l1SubmissionOffset],
                [5, 0 + this.options.gLine1Offset +
                 this.options.l1SubmissionOffset]
            ], {
                name: this.options.gLine1Label,
                withLabel: true,
                label: { position: 'rt', offset: [-10, 20] },
                strokeColor: 'rgb(255, 127, 14)',
                strokeWidth: 2,
                fixed: this.options.isSubmitted
            });
    }
}

let mkConsumptionSaving = function(board, options) {
    let g = new ConsumptionSavingGraph(board, options);
    g.make();
    g.postMake();
    return g;
};

class SavingInvestmentGraph extends Graph {
    make() {
        this.l1 = this.board.create(
            'line', [
                [0, 5 + this.options.gLine1Offset +
                 this.options.l1SubmissionOffset],
                [5, 0 + this.options.gLine1Offset +
                this.options.l1SubmissionOffset]
            ], {
                name: this.options.gLine1Label,
                withLabel: true,
                label: { position: 'rt', offset: [-10, 20] },
                strokeColor: 'rgb(255, 127, 14)',
                strokeWidth: 2,
                fixed: this.options.isSubmitted
            });

        this.l2 = this.board.create(
            'line', [
                [0, 0 + this.options.gLine2Offset +
                 this.options.l2SubmissionOffset],
                [5, 5 + this.options.gLine2Offset +
                 this.options.l2SubmissionOffset]
            ], {
                name: this.options.gLine2Label,
                withLabel: true,
                label: { position: 'rt', offset: [0, 0] },
                strokeColor: 'steelblue',
                strokeWidth: 2,
                fixed: this.options.isSubmitted
            });
    }
}

let mkSavingInvestment = function(board, options) {
    let g = new SavingInvestmentGraph(board, options);
    g.make();
    g.postMake();
    return g;
};

class MoneyMarketGraph extends Graph {
    make() {
        this.l1 = this.board.create(
            'line', [
                [0, 5 + this.options.gLine1Offset +
                 this.options.l1SubmissionOffset],
                [5, 0 + this.options.gLine1Offset +
                 this.options.l1SubmissionOffset]
            ], {
                name: this.options.gLine1Label,
                withLabel: true,
                label: { position: 'rt', offset: [-10, 20] },
                strokeColor: 'rgb(255, 127, 14)',
                strokeWidth: 2,
                fixed: this.options.isSubmitted
            });

        this.l2 = this.board.create(
            'line', [
                [0, 0 + this.options.gLine2Offset +
                 this.options.l2SubmissionOffset],
                [5, 5 + this.options.gLine2Offset +
                 this.options.l2SubmissionOffset]
            ], {
                name: this.options.gLine2Label,
                withLabel: true,
                label: { position: 'rt', offset: [0, 0] },
                strokeColor: 'steelblue',
                strokeWidth: 2,
                fixed: this.options.isSubmitted
            });
    }
}

let mkMoneyMarket = function(board, options) {
    let g = new MoneyMarketGraph(board, options);
    g.make();
    g.postMake();
    return g;
};

export const graphTypes = [
    mkDemandSupply, mkLaborMarket,
    mkLaborMarketPerfectlyInelastic, mkCobbDouglas,
    mkLaborSupply, mkConsumptionSaving,
    mkSavingInvestment, mkMoneyMarket
];
