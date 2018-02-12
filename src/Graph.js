/**
 * Graph.js
 *
 * Each graph type is a sub-class of the common Graph class.
 */

import { defaultGraph } from './GraphMapping';
import { forceFloat, getOffset } from './utils';

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
            defaults = defaultGraph;
        }

        if (typeof options === 'undefined') {
            options = {};
        }

        // Line 1 and line 2
        this.l1 = null;
        this.l1Color = 'rgb(255, 127, 14)';
        this.l2 = null;
        this.l2Color = 'steelblue';

        this.options = applyDefaults(options, defaults);

        this.areLinesFixed = this.options.locked ||
            this.options.isSubmitted ||
            (this.options.interactionType === 2);

        this.board = board;
    }
    resetLine1() {
        if (!this.l1) {
            return;
        }
        this.l1.point1.moveTo([
            2.5,
            2.5 + this.options.gLine1Offset]);
        this.l1.point2.moveTo([
            3.5,
            2.5 + this.options.gLine1Offset +
                this.options.gLine1Slope]);
    }
    resetLine2() {
        if (!this.l2) {
            return;
        }
        this.l2.point1.moveTo([
            2.5,
            2.5 + this.options.gLine2Offset]);
        this.l2.point2.moveTo([
            3.5,
            2.5 + this.options.gLine2Offset +
                this.options.gLine2Slope]);
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
            strokeWidth: this.board.canvasWidth / 25.5,
            straightFirst: true,
            straightLast: true
        });
        this.board.create('line', [[0, -0.2], [5, -0.2]], {
            dash: 0,
            highlight: false,
            fixed: true,
            strokeColor: 'white',
            strokeWidth: this.board.canvasWidth / 25.5,
            straightFirst: true,
            straightLast: true
        });

        const me = this;

        if (
            this.l1 && (typeof this.l1.getRise === 'function') &&
                !this.options.isSubmitted
        ) {
            this.initialL1Y = this.l1.getRise();

            if (window.EconPlayground.isInstructor) {
                this.l1.on('mouseup', function() {
                    const offset = getOffset(
                        me.l1.getSlope(), me.l1.getRise(), 2.5);
                    const offsetEvt = new CustomEvent('l1offset', {
                        detail: offset
                    });
                    document.dispatchEvent(offsetEvt);
                });
            } else {
                this.l1.on('mouseup', function() {
                    // Only do this line reset functionality if this
                    // is a submittable graph. Otherwise, students
                    // should be able to play freely.
                    if (me.options.gNeedsSubmit) {
                        me.resetLine2();
                    }

                    if (this.getRise() > me.initialL1Y) {
                        document.dispatchEvent(new Event('l1up'));
                    } else if (this.getRise() < me.initialL1Y) {
                        document.dispatchEvent(new Event('l1down'));
                    } else {
                        document.dispatchEvent(new Event('l1initial'));
                    }
                });
            }
        }

        if (
            this.l2 && (typeof this.l2.getRise === 'function') &&
                !this.options.isSubmitted
        ) {
            this.initialL2Y = this.l2.getRise();

            if (window.EconPlayground.isInstructor) {
                this.l2.on('mouseup', function() {
                    const offset = getOffset(
                        me.l2.getSlope(), me.l2.getRise(), 2.5);
                    const offsetEvt = new CustomEvent('l2offset', {
                        detail: offset
                    });
                    document.dispatchEvent(offsetEvt);
                });
            } else {
                this.l2.on('mouseup', function() {
                    // Only do this line reset functionality if this
                    // is a submittable graph. Otherwise, students
                    // should be able to play freely.
                    if (me.options.gNeedsSubmit) {
                        me.resetLine1();
                    }

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
            name: this.options.gIntersectionLabel || '',
            fixed: true,
            showInfobox: false
        });
        this.i = i;

        let p1 = this.board.create('point', [0, i.Y()], {
            size: 0,
            name: this.options.gIntersectionHorizLineLabel || '',
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
            name: this.options.gIntersectionVertLineLabel || '',
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
                strokeColor: this.l1Color,
                strokeWidth: 2,
                fixed: this.areLinesFixed
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
                label: { position: 'rt', offset: [0, 35] },
                strokeColor: this.l2Color,
                strokeWidth: 2,
                fixed: this.areLinesFixed
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

class NonLinearDemandSupplyGraph extends Graph {
    make() {
        const me = this;
        const alpha = 0.3;

        if (me.options.shadow) {
            // Display the initial curves set by the instructor.
            this.l1 = this.board.create('line', [
                [2.5, 2.5 + this.options.gLine1OffsetInitial],
                [3.5, 2.5 + this.options.gLine1OffsetInitial +
                 this.options.gLine1SlopeInitial]
            ], {
                withLabel: false,
                strokeColor: 'rgb(100, 100, 100)',
                strokeWidth: 2,
                fixed: true,
                layer: 4
            });

            const fShadow = function(x) {
                return (1 - alpha) *
                    (me.options.gCobbDouglasAInitial *
                     me.options.gCobbDouglasKInitial ** alpha) *
                    (x ** -alpha);
            };

            const lfShadow = functionUtils.plot(this.board, fShadow, {
                withLabel: false,
                strokeWidth: 2,
                strokeColor: 'rgb(100, 100, 100)',
                fixed: true,
                layer: 4
            });

            lfShadow.setPosition(window.JXG.COORDS_BY_USER, [
                forceFloat(this.options.gLine2OffsetXInitial),
                forceFloat(this.options.gLine2OffsetYInitial)
            ]);
            // This is necessary, because otherwise the setPosition call
            // won't have an effect until the graph is interacted with.
            lfShadow.fullUpdate(true);
        }

        this.l1 = this.board.create('line', [
            [2.5, 2.5 + this.options.gLine1Offset +
             this.options.l1SubmissionOffset],
            [3.5, 2.5 + this.options.gLine1Offset +
             this.options.gLine1Slope + this.options.l1SubmissionOffset]
        ], {
            name: this.options.gLine1Label,
            withLabel: true,
            label: { position: 'rt', offset: [10, -20] },
            strokeColor: this.l1Color,
            strokeWidth: 2,
            fixed: this.areLinesFixed
        });

        const f = function(x) {
            return (1 - alpha) *
                (me.options.gCobbDouglasA *
                 me.options.gCobbDouglasK ** alpha) *
                (x ** -alpha);
        };

        this.l2 = functionUtils.plot(this.board, f, {
            name: this.options.gLine2Label,
            withLabel: true,
            strokeWidth: 2,
            strokeColor: this.l2Color,
            fixed: this.areLinesFixed
        });

        this.l2.setPosition(window.JXG.COORDS_BY_USER, [
            forceFloat(this.options.gLine2OffsetX),
            forceFloat(this.options.gLine2OffsetY)
        ]);
        // This is necessary, because otherwise the setPosition call
        // won't have an effect until the graph is interacted with.
        this.l2.fullUpdate(true);

        this.l2.on('mouseup', function() {
            const xOffset = me.l2.transformations[0].matrix[1][0];
            const yOffset = me.l2.transformations[0].matrix[2][0];
            const offsetEvt = new CustomEvent('l2offset', {
                detail: {
                    x: xOffset,
                    y: yOffset
                }
            });
            document.dispatchEvent(offsetEvt);
        });

        if (this.options.gShowIntersection) {
            this.showIntersection(this.l1, this.l2);
        }
    }
}

let mkNonLinearDemandSupply = function(board, options) {
    let g = new NonLinearDemandSupplyGraph(board, options);
    g.make();
    g.postMake();
    return g;
};

class CobbDouglasGraph extends Graph {
    make() {
        const me = this;
        const f = function(x) {
            return me.options.gCobbDouglasA *
                (me.options.gCobbDouglasK ** me.options.gCobbDouglasAlpha) *
                (x ** (1 - me.options.gCobbDouglasAlpha));
        };

        functionUtils.plot(this.board, f, {
            name: this.options.gLine1Label,
            withLabel: true,
            strokeWidth: 2,
            strokeColor: this.l1Color
        });

        if (me.options.shadow) {
            // Display the initial curve set by the instructor.
            const fShadow = function(x) {
                return me.options.gCobbDouglasAInitial *
                    (me.options.gCobbDouglasKInitial **
                     me.options.gCobbDouglasAlphaInitial) *
                    (x ** (1 - me.options.gCobbDouglasAlphaInitial));
            };

            functionUtils.plot(this.board, fShadow, {
                name: this.options.gLine1Label,
                withLabel: false,
                strokeWidth: 2,
                strokeColor: 'rgb(100, 100, 100)',
                // Under the main line layer
                layer: 4
            });
        }

        const pName = 'F(' + me.options.gCobbDouglasAName + ',' +
              me.options.gCobbDouglasKName + ',' +
              me.options.gCobbDouglasLName + ')';

        let p = this.board.create('point', [
            me.options.gCobbDouglasL,
            f(me.options.gCobbDouglasL)], {
                name: pName,
                fixed: true
            });

        this.board.create('line', [p, [p.X(), 0]], {
            dash: 1,
            strokeColor: 'black',
            strokeWidth: 1,
            straightFirst: false,
            straightLast: false
        });

        this.board.create('line', [[0, p.Y()], p], {
            dash: 1,
            strokeColor: 'black',
            strokeWidth: 1,
            straightFirst: false,
            straightLast: false
        });
    }
}

let mkCobbDouglas = function(board, options) {
    let g = new CobbDouglasGraph(board, options);
    g.make();
    g.postMake();
    return g;
};

class OptimalIndividualChoiceGraph extends Graph {
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
                strokeColor: this.l1Color,
                strokeWidth: 2,
                fixed: this.areLinesFixed
            });
    }
}

let mkOptimalIndividualChoice = function(board, options) {
    let g = new OptimalIndividualChoiceGraph(board, options);
    g.make();
    g.postMake();
    return g;
};

export const graphTypes = [
    // There are some null graph types here because the number of
    // total graphs in the system has been reduced since it was
    // originally designed, and I haven't updated the graph type
    // numerical values to reflect that yet.
    mkDemandSupply, mkNonLinearDemandSupply,
    null, mkCobbDouglas,
    null, mkOptimalIndividualChoice,
    null, null
];
