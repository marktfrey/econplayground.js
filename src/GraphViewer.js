import React from 'react';
import Cookies from 'js-cookie';
import PropTypes from 'prop-types';
import JXGBoard from './JXGBoard';
import Feedback from './Feedback';
import RangeEditor from './RangeEditor';
import {
    authedFetch, getOrCreateSubmission, handleFormUpdate
} from './utils';

/**
 * This component is used to view an econgraph object.
 */
export default class GraphViewer extends React.Component {
    render() {
        let action = '';
        if (window.EconPlayground && window.EconPlayground.LTIPostGrade) {
            action = window.EconPlayground.LTIPostGrade;
        }

        let successUrl = '/';
        if (window.EconPlayground && window.EconPlayground.EmbedSuccess) {
            successUrl = window.EconPlayground.EmbedSuccess;
        }

        let launchUrl = '';
        if (window.EconPlayground && window.EconPlayground.EmbedLaunchUrl) {
            launchUrl = window.EconPlayground.EmbedLaunchUrl;
        }

        let isInstructor = false;
        if (window.EconPlayground && window.EconPlayground.isInstructor) {
            isInstructor = window.EconPlayground.isInstructor.toLowerCase() === 'true';
        }

        const token = Cookies.get('csrftoken');

        return (
            <div className="GraphViewer">
                <h5>{this.props.gTitle}</h5>
                <p>{this.props.gDescription}</p>
                <form onSubmit={this.handleSubmit.bind(this)} action={action} method="post">
                    <input type="hidden" name="csrfmiddlewaretoken" value={token} />
                    <input type="hidden" name="score" value={this.props.value} />
                    <input type="hidden" name="next" value={successUrl} />
                    <input type="hidden" name="launchUrl" value={launchUrl} />
                    <JXGBoard
                         id={'editing-graph'}
                         width={562.5}
                         height={300}
                         submission={this.props.submission}
                         gType={this.props.gType}
                         gLine1Label={this.props.gLine1Label}
                         gLine2Label={this.props.gLine2Label}
                         gXAxisLabel={this.props.gXAxisLabel}
                         gYAxisLabel={this.props.gYAxisLabel}
                         gLine1Slope={this.props.gLine1Slope}
                         gLine2Slope={this.props.gLine2Slope}
                         gLine1Offset={this.props.gLine1Offset}
                         gLine2Offset={this.props.gLine2Offset}
                         gNeedsSubmit={this.props.gNeedsSubmit}
                         gShowIntersection={this.props.gShowIntersection}
                         gIntersectionLabel={this.props.gIntersectionLabel}
                         gIntersectionHorizLineLabel={this.props.gIntersectionHorizLineLabel}
                         gIntersectionVertLineLabel={this.props.gIntersectionVertLineLabel}

                         gCobbDouglasA={this.props.gCobbDouglasA}
                         gCobbDouglasL={this.props.gCobbDouglasL}
                         gCobbDouglasK={this.props.gCobbDouglasK}
                         gCobbDouglasAlpha={this.props.gCobbDouglasAlpha}
                         />

                    <Feedback
                         choice={this.props.choice}
                         submission={this.props.submission}
                         isSubmitted={!!this.props.submission}
                         gNeedsSubmit={this.props.gNeedsSubmit}
                         gDisplayFeedback={this.props.gDisplayFeedback}
                         gLine1FeedbackIncrease={this.props.gLine1FeedbackIncrease}
                         gLine1FeedbackDecrease={this.props.gLine1FeedbackDecrease}
                         gLine2FeedbackIncrease={this.props.gLine2FeedbackIncrease}
                         gLine2FeedbackDecrease={this.props.gLine2FeedbackDecrease} />

                    <div className={this.props.gType === 3 ? '' : 'd-none'} >
                        This is a projection of the Cobb-Douglas
                        function with L plotted along the X-axis.
                        <div className="ml-2 mb-2">
                            <img width="120" height="18.33" src="data:image/png;base64,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" />
                        </div>

                    </div>

                    <div className={'row ' + (this.props.gType === 3 ? '' : 'd-none')} >
                        <div className="col-sm-4">
                            <label htmlFor="gCobbDouglasA">
                                A
                            </label>
                            <RangeEditor
                                 dataId="gCobbDouglasA"
                                 value={this.props.gCobbDouglasA}
                                 handler={handleFormUpdate.bind(this)}
                                 min={0} />
                        </div>
                        <div className="col-sm-2">
                            <label></label>
                            <div className="form-check">
                                <label className="form-check-label">
                                    <input
                                         id="gLine1SlopeEditable"
                                         className="form-check-input"
                                         type="checkbox"
                                         onChange={handleFormUpdate.bind(this)}
                                         checked={this.props.gLine1SlopeEditable} />
                                    Student editable
                                </label>
                            </div>
                        </div>

                        <div className="col-sm-4">
                            <div className="form-group">
                                <label htmlFor="gCobbDouglasK">
                                    K
                                </label>
                                <RangeEditor
                                     dataId="gCobbDouglasK"
                                     value={this.props.gCobbDouglasK}
                                     handler={handleFormUpdate.bind(this)}
                                     min={0} />
                            </div>
                        </div>
                        <div className="col-sm-2">
                            <label></label>
                            <div className="form-check">
                                <label className="form-check-label">
                                    <input
                                         id="gLine2SlopeEditable"
                                         className="form-check-input"
                                         type="checkbox"
                                         onChange={handleFormUpdate.bind(this)}
                                         checked={this.props.gLine2SlopeEditable} />
                                    Student editable
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className={'row ' + (this.props.gType === 3 ? '' : 'd-none')} >
                        <div className="col-sm-4">
                            <label htmlFor="gLine1Slope">
                                &alpha;
                            </label>
                            <RangeEditor
                                 dataId="gCobbDouglasAlpha"
                                 value={this.props.gCobbDouglasAlpha}
                                 handler={handleFormUpdate.bind(this)}
                                 min={0}
                                 max={1} />
                        </div>
                        <div className="col-sm-2">
                            <label></label>
                            <div className="form-check">
                                <label className="form-check-label">
                                    <input
                                         id="gLine1SlopeEditable"
                                         className="form-check-input"
                                         type="checkbox"
                                         onChange={handleFormUpdate.bind(this)}
                                         checked={this.props.gLine1SlopeEditable} />
                                    Student editable
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className={'form-row ' + (this.props.gType !== 3 ? '' : 'd-none')}>
                        <div className={"col " + (this.props.gLine1SlopeEditable ? '' : 'd-none')}>
                            <label htmlFor="gLine1Slope">
                                Orange line slope
                            </label>
                            <RangeEditor
                                 dataId="gLine1Slope"
                                 value={this.props.gLine1Slope}
                                 handler={handleFormUpdate.bind(this)} />
                        </div>

                        <div className={"col " + (this.props.gLine2SlopeEditable ? '' : 'd-none')}>
                            <div className="form-group">
                                <label htmlFor="gLine2Slope">
                                    Blue line slope
                                </label>
                                <RangeEditor
                                     dataId="gLine2Slope"
                                     value={this.props.gLine2Slope}
                                     handler={handleFormUpdate.bind(this)} />
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className={"col " + (this.props.gLine1LabelEditable ? '' : 'd-none')}>
                            <div className="form-group">
                                <label htmlFor="gLine1Label">
                                    Orange line label
                                </label>
                                <input id="gLine1Label"
                                       value={this.props.gLine1Label}
                                       onChange={handleFormUpdate.bind(this)}
                                       className="form-control form-control-sm" type="text" />
                            </div>
                        </div>
                        <div className={"col " + (this.props.gLine2LabelEditable ? '' : 'd-none')}>
                            <div className="form-group">
                                <label htmlFor="gLine2Label">
                                    Blue line label
                                </label>
                                <input id="gLine2Label"
                                       value={this.props.gLine2Label}
                                       onChange={handleFormUpdate.bind(this)}
                                       className="form-control form-control-sm" type="text" />
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className={"col " + (this.props.gXAxisLabelEditable ? '' : 'd-none')}>
                            <div className="form-group">
                                <label htmlFor="gXAxisLabel">
                                    X-axis label:
                                </label>
                                <input id="gXAxisLabel"
                                       className="form-control form-control-sm"
                                       type="text"
                                       value={this.props.gXAxisLabel}
                                       onChange={handleFormUpdate.bind(this)}
                                       />
                            </div>
                        </div>

                        <div className={"col " + (this.props.gYAxisLabelEditable ? '' : 'd-none')}>
                            <div className="form-group">
                                <label htmlFor="gYAxisLabel">
                                    Y-axis label:
                                </label>
                                <input id="gYAxisLabel"
                                       className="form-control form-control-sm"
                                       type="text"
                                       value={this.props.gYAxisLabel}
                                       onChange={handleFormUpdate.bind(this)}
                                       />
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className={"col-sm-6 " + (this.props.gIntersectionLabelEditable ? '' : 'd-none')}>
                            <div className="form-group">
                                <label htmlFor="gIntersectionLabel">
                                    Intersection point label:
                                </label>
                                <input id="gIntersectionLabel"
                                       className="form-control form-control-sm"
                                       type="text"
                                       value={this.props.gIntersectionLabel}
                                       onChange={handleFormUpdate.bind(this)}
                                       />
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className={"col " + (this.props.gIntersectionHorizLineLabelEditable ? '' : 'd-none')}>
                            <div className="form-group">
                                <label htmlFor="gIntersectionHorizLineLabel">
                                    Intersection&apos;s horizontal line label:
                                </label>
                                <input id="gIntersectionHorizLineLabel"
                                       className="form-control form-control-sm"
                                       type="text"
                                       value={this.props.gIntersectionHorizLineLabel}
                                       onChange={handleFormUpdate.bind(this)} />
                            </div>
                        </div>

                        <div className={"col " + (this.props.gIntersectionVertLineLabelEditable ? '' : 'd-none')}>
                            <div className="form-group">
                                <label htmlFor="gIntersectionVertLineLabel">
                                    Intersection&apos;s vertical line label:
                                </label>
                                <input id="gIntersectionVertLineLabel"
                                       className="form-control form-control-sm"
                                       type="text"
                                       value={this.props.gIntersectionVertLineLabel}
                                       onChange={handleFormUpdate.bind(this)} />
                            </div>
                        </div>
                    </div>

                    <hr style={{
                            display: (this.props.gNeedsSubmit && !this.props.submission) ? 'inherit' : 'none'
                        }} />

                    <button className="btn btn-primary btn-sm"
                            disabled={!this.props.choice}
                            style={{
                                marginTop: '1em',
                                display: (!isInstructor && this.props.gNeedsSubmit && !this.props.submission) ? 'inherit' : 'none'
                            }}
                            type="submit">Submit</button>
                </form>
            </div>
        )
    }
    createSubmission(data) {
        const me = this;
        return authedFetch('/api/submissions/', 'post', JSON.stringify(data))
            .then(function(response) {
                if (response.status === 201) {
                    me.setState({
                        alertText: response.statusText
                    });
                    window.scrollTo(0, 0);
                } else {
                    me.setState({
                        alertText: response.statusText
                    });
                    window.scrollTo(0, 0);
                    throw 'Submission not created';
                }
            });
    }
    handleSubmit(event) {
        // Make the Submission obj in Django, then submit to Canvas
        // with LTI.
        event.preventDefault();
        const form = event.target;
        getOrCreateSubmission({
            graph: this.props.gId,
            choice: this.props.choice,
            score: this.props.value
        }).then(function() {
            form.submit();
        });
    }
}

GraphViewer.propTypes = {
    gId: PropTypes.number,
    gTitle: PropTypes.string,
    gDescription: PropTypes.string,
    gNeedsSubmit: PropTypes.bool,

    gShowIntersection: PropTypes.bool,
    gIntersectionLabel: PropTypes.string,
    gIntersectionLabelEditable: PropTypes.bool,
    gIntersectionHorizLineLabel: PropTypes.string,
    gIntersectionHorizLineLabelEditable: PropTypes.bool,
    gIntersectionVertLineLabel: PropTypes.string,
    gIntersectionVertLineLabelEditable: PropTypes.bool,

    gDisplayFeedback: PropTypes.bool,
    gLine1Label: PropTypes.string,
    gLine1LabelEditable: PropTypes.bool,
    gLine2Label: PropTypes.string,
    gLine2LabelEditable: PropTypes.bool,
    gXAxisLabel: PropTypes.string,
    gXAxisLabelEditable: PropTypes.bool,
    gYAxisLabel: PropTypes.string,
    gYAxisLabelEditable: PropTypes.bool,
    gLine1Slope: PropTypes.number,
    gLine1SlopeEditable: PropTypes.bool,
    gLine2Slope: PropTypes.number,
    gLine2SlopeEditable: PropTypes.bool,
    gLine1Offset: PropTypes.number,
    gLine2Offset: PropTypes.number,
    gLine1FeedbackIncrease: PropTypes.string,
    gLine1IncreaseScore: PropTypes.number,
    gLine1FeedbackDecrease: PropTypes.string,
    gLine1DecreaseScore: PropTypes.number,
    gLine2FeedbackIncrease: PropTypes.string,
    gLine2IncreaseScore: PropTypes.number,
    gLine2FeedbackDecrease: PropTypes.string,
    gLine2DecreaseScore: PropTypes.number,
    gType: PropTypes.number,

    gCobbDouglasA: PropTypes.number,
    gCobbDouglasL: PropTypes.number,
    gCobbDouglasK: PropTypes.number,
    gCobbDouglasAlpha: PropTypes.number,

    submission: PropTypes.object,
    updateGraph: PropTypes.func.isRequired,
    choice: PropTypes.number,
    value: PropTypes.string
};
