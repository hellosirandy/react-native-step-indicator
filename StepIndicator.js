
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, Animated, TouchableWithoutFeedback, Image } from 'react-native';

const STEP_STATUS = {
  CURRENT: 'current',
  FINISHED: 'finished',
  UNFINISHED: 'unfinished'
}

export default class StepIndicator extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      width: 0,
      height: 0,
      progressBarSize: 0
    }

    const defaultStyles = {
      stepIndicatorSize: 30,
      currentStepIndicatorSize: 40,
      separatorStrokeWidth: 3,
      currentStepStrokeWidth: 5,
      stepStrokeWidth: 0,
      stepStrokeCurrentColor: '#4aae4f',
      stepStrokeFinishedColor: '#4aae4f',
      stepStrokeUnFinishedColor: '#4aae4f',
      separatorFinishedColor: '#4aae4f',
      separatorUnFinishedColor: '#a4d4a5',
      stepIndicatorFinishedColor: '#4aae4f',
      stepIndicatorUnFinishedColor: '#a4d4a5',
      stepIndicatorCurrentColor: '#ffffff',
      stepIndicatorLabelFontSize: 15,
      currentStepIndicatorLabelFontSize: 15,
      stepIndicatorLabelCurrentColor: '#000000',
      stepIndicatorLabelFinishedColor: '#ffffff',
      stepIndicatorLabelUnFinishedColor: 'rgba(255,255,255,0.5)',
      labelColor: '#000000',
      labelSize: 13,
      sublabelSize: 11,
      currentStepLabelColor: '#4aae4f',
      finishedStedLabelColor: '#999999',
      rightLabelAlign: 'flex-end',
      leftPortion: 50,
    };

    this.customStyles = Object.assign(defaultStyles, props.customStyles);
    this.progressAnim = new Animated.Value(0)
    this.sizeAnim = new Animated.Value(this.customStyles.stepIndicatorSize);
    this.borderRadiusAnim = new Animated.Value(this.customStyles.stepIndicatorSize / 2);
  }

  stepPressed(position) {
    if (this.props.onPress) {
      this.props.onPress(position)
    }
  }

  render() {
    const { labels, direction, inProgress } = this.props;
    return (
      <View style={[styles.container, direction === 'vertical' ? { flexDirection: 'row', flex: 1 } : { flexDirection: 'column' }]}>
        {this.state.width !== 0 && this.renderProgressBarBackground()}
        {this.state.width !== 0 && this.renderProgressBar()}
        {this.renderStepIndicator()}
        {inProgress && this.renderRelayPoint()}
        {labels && this.renderStepLabels()}
      </View>
    );
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentPosition !== this.props.currentPosition) {
      this.onCurrentPositionChanged(nextProps.currentPosition);
    }
  }

  renderRelayPoint = () => {
    const { stepCount, direction, inProgress, currentPosition, inProgressImage } = this.props;
    let position = currentPosition;
    if (position > stepCount - 1) {
      position = stepCount - 1;
    }
    position = (this.state.progressBarSize / (stepCount - 1)) * (inProgress ? (position + 0.5) : position);
    let relayPointStyle;
    if (direction === 'vertical') {
      relayPointStyle = {
        position: 'absolute',
        zIndex: 999,
        left: (this.state.width - this.customStyles.currentStepIndicatorSize) / 2,
        top: this.state.height / (2 * stepCount) + position - this.customStyles.currentStepIndicatorSize / 2,
        width: this.customStyles.currentStepIndicatorSize,
        height: this.customStyles.currentStepIndicatorSize,
      }
    } else {
      relayPointStyle = {
        position: 'absolute',
        zIndex: 999,
        top: (this.state.height - this.customStyles.currentStepIndicatorSize) / 2,
        left: this.state.width / (2 * stepCount) + position - this.customStyles.currentStepIndicatorSize / 2,
        width: this.customStyles.currentStepIndicatorSize,
        height: this.customStyles.currentStepIndicatorSize,
      }
    }
    return (
      <Image source={inProgressImage} style={relayPointStyle} resizeMode="contain" />
    )
  }

  renderProgressBarBackground = () => {
    const { stepCount, direction } = this.props;
    let progressBarBackgroundStyle;
    if (direction === 'vertical') {
      progressBarBackgroundStyle = {
        backgroundColor: this.customStyles.separatorUnFinishedColor,
        position: 'absolute',
        left: (this.state.width - this.customStyles.separatorStrokeWidth) / 2,
        top: this.state.height / (2 * stepCount),
        bottom: this.state.height / (2 * stepCount),
        width: this.customStyles.separatorStrokeWidth
      }
    }
    else {
      progressBarBackgroundStyle = {
        backgroundColor: this.customStyles.separatorUnFinishedColor,
        position: 'absolute',
        top: (this.state.height - this.customStyles.separatorStrokeWidth) / 2,
        left: this.state.width / (2 * stepCount),
        right: this.state.width / (2 * stepCount),
        height: this.customStyles.separatorStrokeWidth
      }
    }
    return (
      <View
        onLayout={(event) => {
          if (direction === 'vertical') {
            this.setState({ progressBarSize: event.nativeEvent.layout.height }, () => { this.onCurrentPositionChanged(this.props.currentPosition) })
          }
          else {
            this.setState({ progressBarSize: event.nativeEvent.layout.width }, () => { this.onCurrentPositionChanged(this.props.currentPosition) })
          }
        }}
        style={progressBarBackgroundStyle} />
    )
  }

  renderProgressBar = () => {
    const { stepCount, direction } = this.props;
    let progressBarStyle;
    if (direction === 'vertical') {
      progressBarStyle = {
        backgroundColor: this.customStyles.separatorFinishedColor,
        position: 'absolute',
        left: (this.state.width - this.customStyles.separatorStrokeWidth) / 2,
        top: this.state.height / (2 * stepCount),
        bottom: this.state.height / (2 * stepCount),
        width: this.customStyles.separatorStrokeWidth,
        height: this.progressAnim
      }
    }
    else {
      progressBarStyle = {
        backgroundColor: this.customStyles.separatorFinishedColor,
        position: 'absolute',
        top: (this.state.height - this.customStyles.separatorStrokeWidth) / 2,
        left: this.state.width / (2 * stepCount),
        right: this.state.width / (2 * stepCount),
        height: this.customStyles.separatorStrokeWidth,
        width: this.progressAnim
      }
    }
    return (
      <Animated.View
        style={progressBarStyle} />
    )
  }

  renderStepIndicator = () => {
    let steps = [];
    const { labels, stepCount, direction } = this.props;
    for (let position = 0; position < stepCount; position++) {
      steps.push(
        <TouchableWithoutFeedback key={position} onPress={() => this.stepPressed(position)}>
          <View style={[styles.stepContainer, direction === 'vertical' ? { flexDirection: 'column' } : { flexDirection: 'row' }]}>
            {this.renderStep(position)}
          </View>
        </TouchableWithoutFeedback>
      )
    }
    return (
      <View onLayout={(event) => this.setState({ width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height })} style={[styles.stepIndicatorContainer, direction === 'vertical' ? { flexDirection: 'column', width: this.customStyles.currentStepIndicatorSize } : { flexDirection: 'row', height: this.customStyles.currentStepIndicatorSize }]}>
        {steps}
      </View>
    )
  }

  renderStepLabels = () => {
    const { labels, direction, currentPosition, sublabels, rightLabels } = this.props;
    var labelViews = labels.map((label, index) => {
      let selectedStepLabelStyle = { color: this.customStyles.labelColor }
      if (index < currentPosition) {
        selectedStepLabelStyle = { color: this.customStyles.finishedStedLabelColor }
      } else if (index === currentPosition) {
        selectedStepLabelStyle = { color: this.customStyles.currentStepLabelColor }
      }
      const sublabel = (sublabels && sublabels[index]) ? (
        <Text style={[styles.stepSublabel, { fontSize: this.customStyles.sublabelSize }]}>
          {sublabels[index]}
        </Text>
      ) : null;
      const rightLabel = rightLabels ? (
        <Text style={[styles.stepRightLabel, { fontSize: this.customStyles.sublabelSize, alignSelf: this.customStyles.rightLabelAlign }]}>
          {rightLabels[index]}
        </Text>
      ) : null;
      const labelHeight = `${(1 / labels.length) * 100}%`;
      return (
        <TouchableWithoutFeedback style={[styles.stepLabelItem]} key={index} onPress={() => this.stepPressed(index)}>
          <View style={{ flexDirection: 'row', width: '100%', height: labelHeight }}>
            <View style={[styles.stepLabelItem, { width: `${this.customStyles.leftPortion}%` }]}>
              <Text style={[styles.stepLabel, selectedStepLabelStyle, { fontSize: this.customStyles.labelSize }]}>
                {label}
              </Text>
              {sublabel}
            </View>
            <View style={[styles.stepLabelItem, { width: `${100 - this.customStyles.leftPortion}%` }]}>
              {rightLabel}
            </View>
          </View>
        </TouchableWithoutFeedback>
      )
    });

    return (
      <View style={[styles.stepLabelsContainer, direction === 'vertical' ? { flexDirection: 'column', paddingHorizontal: 10, alignItems: 'flex-start' } : { flexDirection: 'row', paddingVertical: 4 }]}>
        {labelViews}
      </View>
    )
  }

  renderStep = (position) => {
    const { currentPosition, stepCount, direction, renderStepIndicator } = this.props;
    let stepStyle;
    let indicatorLabelStyle;
    const separatorStyle = (direction === 'vertical') ? { width: this.customStyles.separatorStrokeWidth, zIndex: 10 } : { height: this.customStyles.separatorStrokeWidth }
    switch (this.getStepStatus(position)) {
      case STEP_STATUS.CURRENT: {
        stepStyle = {
          backgroundColor: this.customStyles.stepIndicatorCurrentColor,
          borderWidth: this.customStyles.currentStepStrokeWidth,
          borderColor: this.customStyles.stepStrokeCurrentColor,
          height: this.sizeAnim,
          width: this.sizeAnim,
          borderRadius: this.borderRadiusAnim
        };
        indicatorLabelStyle = { fontSize: this.customStyles.currentStepIndicatorLabelFontSize, color: this.customStyles.stepIndicatorLabelCurrentColor };

        break;
      }
      case STEP_STATUS.FINISHED: {
        stepStyle = {
          backgroundColor: this.customStyles.stepIndicatorFinishedColor,
          borderWidth: this.customStyles.stepStrokeWidth,
          borderColor: this.customStyles.stepStrokeFinishedColor,
          height: this.customStyles.stepIndicatorSize,
          width: this.customStyles.stepIndicatorSize,
          borderRadius: (this.customStyles.stepIndicatorSize) / 2
        };
        indicatorLabelStyle = { fontSize: this.customStyles.stepIndicatorLabelFontSize, color: this.customStyles.stepIndicatorLabelFinishedColor };
        break;
      }

      case STEP_STATUS.UNFINISHED: {
        stepStyle = {
          backgroundColor: this.customStyles.stepIndicatorUnFinishedColor,
          borderWidth: this.customStyles.stepStrokeWidth,
          borderColor: this.customStyles.stepStrokeUnFinishedColor,
          height: this.customStyles.stepIndicatorSize,
          width: this.customStyles.stepIndicatorSize,
          borderRadius: (this.customStyles.stepIndicatorSize) / 2
        };
        indicatorLabelStyle = { overflow: 'hidden', fontSize: this.customStyles.stepIndicatorLabelFontSize, color: this.customStyles.stepIndicatorLabelUnFinishedColor };
        break;
      }
      default:
    }

    return (
      <Animated.View key={'step-indicator'} style={[styles.step, stepStyle]}>
        {
          renderStepIndicator ? renderStepIndicator({
            position,
            stepStatus: this.getStepStatus(position),
          }) : <Text style={indicatorLabelStyle}>{position + 1}</Text>}
      </Animated.View>
    );
  }

  getStepStatus = (stepPosition) => {
    const { currentPosition } = this.props;
    if (stepPosition === currentPosition) {
      return STEP_STATUS.CURRENT;
    }
    else if (stepPosition < currentPosition) {
      return STEP_STATUS.FINISHED;
    }
    else {
      return STEP_STATUS.UNFINISHED;
    }
  }

  onCurrentPositionChanged = (position) => {
    let { stepCount, inProgress } = this.props
    if (position > stepCount - 1) {
      position = stepCount - 1;
    }
    let animateToPosition = (this.state.progressBarSize / (stepCount - 1)) * position;
    if (inProgress) {
      animateToPosition = (this.state.progressBarSize / (stepCount - 1)) * (position + 0.5) - this.customStyles.currentStepIndicatorSize / 2;
    }
    this.sizeAnim.setValue(this.customStyles.stepIndicatorSize);
    this.borderRadiusAnim.setValue(this.customStyles.stepIndicatorSize / 2);
    Animated.sequence([
      Animated.timing(
        this.progressAnim,
        { toValue: animateToPosition, duration: 500 }
      ),
      Animated.parallel([
        Animated.timing(
          this.sizeAnim,
          { toValue: this.customStyles.currentStepIndicatorSize, duration: 500 }
        ),
        Animated.timing(
          this.borderRadiusAnim,
          { toValue: this.customStyles.currentStepIndicatorSize / 2, duration: 500 }
        )
      ])
    ]).start();
  }

}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent'
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'transparent'
  },
  stepLabelsContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  step: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2
  },
  stepContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepLabel: {
    fontSize: 12,
    textAlign: 'left',
    fontWeight: '500',
  },
  stepSublabel: {
    fontSize: 11,
    color: '#6e6e6e',
    marginTop: 5
  },
  stepRightLabel: {
    fontSize: 11,
    color: '#000000',
  },
  stepLabelItem: {
    alignItems: 'flex-start',
    justifyContent: 'center'
  }
});

StepIndicator.propTypes = {
  currentPosition: PropTypes.number,
  stepCount: PropTypes.number,
  customStyles: PropTypes.object,
  direction: PropTypes.oneOf(['vertical', 'horizontal']),
  labels: PropTypes.array,
  onPress: PropTypes.func,
  renderStepIndicator: PropTypes.func,
};

StepIndicator.defaultProps = {
  currentPosition: 0,
  stepCount: 5,
  customStyles: {},
  direction: 'horizontal'
};
