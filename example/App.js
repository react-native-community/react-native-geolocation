/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 */

import React from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import GeolocationExample from './GeolocationExample';

// Examples which show the user how to correctly use the library
const EXAMPLES = [
  {
    id: 'getCurrentPosition',
    title: 'Geolocation.getCurrentPosition',
    description: 'Asynchronously load and observe location',
    render() {
      return <GeolocationExample />;
    },
  },
];

// Test cases for the e2e tests. THESE ARE NOT EXAMPLES OF BEST PRACTICE
import TEST_CASES from './testCases';

type State = {
  showExamples: boolean,
};

type Props = {};

export default class ExampleApp extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      showExamples: true,
    };
  }

  _toggleMode = () => {
    this.setState(state => ({showExamples: !state.showExamples}));
  };

  render() {
    const {showExamples} = this.state;
    return (
      <ScrollView style={styles.container}>
        <SafeAreaView>
          <Button
            testID="modeToggle"
            onPress={this._toggleMode}
            title={showExamples ? 'Switch to Test Cases' : 'Switch to Examples'}
          />
          {showExamples ? (
            <>
              <Text testID="examplesTitle" style={styles.sectionTitle}>
                Examples
              </Text>
              {EXAMPLES.map(this._renderExample)}
            </>
          ) : (
            <>
              <Text testID="testCasesTitle" style={styles.sectionTitle}>
                Test Cases
              </Text>
              {TEST_CASES.map(this._renderExample)}
            </>
          )}
        </SafeAreaView>
      </ScrollView>
    );
  }

  _renderExample = example => {
    return (
      <View
        testID={`example-${example.id}`}
        key={example.title}
        style={styles.exampleContainer}>
        <Text style={styles.exampleTitle}>{example.title}</Text>
        <Text style={styles.exampleDescription}>{example.description}</Text>
        <View style={styles.exampleInnerContainer}>{example.render()}</View>
      </View>
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  sectionTitle: {
    fontSize: 24,
    marginHorizontal: 8,
    marginTop: 24,
  },
  exampleContainer: {
    padding: 16,
    marginVertical: 4,
    backgroundColor: '#FFF',
    borderColor: '#EEE',
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  exampleTitle: {
    fontSize: 18,
  },
  exampleDescription: {
    color: '#333333',
    marginBottom: 16,
  },
  exampleInnerContainer: {
    borderColor: '#EEE',
    borderTopWidth: 1,
    paddingTop: 16,
  },
});
