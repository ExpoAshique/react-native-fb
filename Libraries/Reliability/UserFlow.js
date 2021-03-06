/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict
 */

'use strict';

const AUTO_INSTANCE_KEY = -1;

export type FlowId = {
  markerId: number,
  instanceKey: number,
};

export type PointData = $Shape<{
  string: ?{[string]: string, ...},
  int: ?{[string]: number, ...},
  double: ?{[string]: number, ...},
  bool: ?{[string]: boolean, ...},
  string_array: ?{[string]: $ReadOnlyArray<string>, ...},
  int_array: ?{[string]: $ReadOnlyArray<number>, ...},
  double_array: ?{[string]: $ReadOnlyArray<number>, ...},
  bool_array: ?{[string]: $ReadOnlyArray<boolean>, ...},
}>;

/**
 * API for tracking reliability of your user interactions
 *
 * Example:
 * const flowId = UserFlow.newFlowId(QuickLogItentifiersExample.EXAMPLE_EVENT);
 * ...
 * UserFlow.start(flowId, {triggerSource: "user_click", cancelOnBackground: true});
 * ...
 * UserFlow.addAnnotation(flowId, "cached", "true");
 * ...
 * UserFlow.addPoint(flowId, "reload");
 * ...
 * UserFlow.endSuccess(flowId);
 */
const UserFlow = {
  /**
   * Creates FlowId from markerId and instanceKey.
   * You will pass FlowId in every other method of UserFlow API.
   *
   * By default, instanceKey will generate unique instance every time you call userFlowGetId with markerId only.
   */
  newFlowId(markerId: number, instanceKey: number = AUTO_INSTANCE_KEY): FlowId {
    var resolvedInstanceKey = instanceKey;
    if (instanceKey === AUTO_INSTANCE_KEY) {
      if (global.nativeUserFlowNextInstanceKey) {
        resolvedInstanceKey = global.nativeUserFlowNextInstanceKey(markerId);
      } else {
        // There is no JSI methods installed, API won't do anything
        resolvedInstanceKey = 0;
      }
    }
    return {
      markerId: markerId,
      instanceKey: resolvedInstanceKey,
    };
  },

  /**
   * Starts new flow.
   * Example:
   * UserFlow.start(flowId, {triggerSource: 'user_click', cancelOnBackground: true})
   *
   * Specify triggerSource as a place where your flow has started.
   * Specify if flow should be automatically cancelled if applicaton goes to background.
   * It is recommended to use true for cancelOnBackground - this reduces amount of lost flows due to instrumentation mistakes.
   * Only if you know that your flow should survive app backgrounding - use false. This includes cases of tracking cross application interactions.
   *
   */
  start(
    flowId: FlowId,
    options: {triggerSource: string, cancelOnBackground: boolean},
  ): void {
    if (global.nativeUserFlowStart) {
      global.nativeUserFlowStart(
        flowId.markerId,
        flowId.instanceKey,
        options.triggerSource,
        options.cancelOnBackground,
      );
    }
  },

  addAnnotation(
    flowId: FlowId,
    annotationName: string,
    annotationValue: string | boolean,
  ): void {
    if (global.nativeUserFlowAddAnnotation) {
      global.nativeUserFlowAddAnnotation(
        flowId.markerId,
        flowId.instanceKey,
        annotationName,
        annotationValue,
      );
    }
  },

  addPoint(flowId: FlowId, pointName: string, data: ?PointData = null): void {
    if (global.nativeUserFlowAddPoint) {
      global.nativeUserFlowAddPoint(
        flowId.markerId,
        flowId.instanceKey,
        pointName,
        data,
      );
    }
  },

  endSuccess(flowId: FlowId): void {
    if (global.nativeUserFlowEndSuccess) {
      global.nativeUserFlowEndSuccess(flowId.markerId, flowId.instanceKey);
    }
  },

  /**
   * Completes flow as failed
   *
   * ErrorName should be short and easily categorazable (it is attached as point to the UserFlow and can be used for aggregations).
   * For example: io_error, network_error, parse_error, validation_error.
   * DebugInfo is free-form string, where you can attach detailed error message. It is attached as data to the point (see ErrorName).
   */
  endFailure(
    flowId: FlowId,
    errorName: string,
    debugInfo: ?string = null,
  ): void {
    if (global.nativeUserFlowEndFail) {
      global.nativeUserFlowEndFail(
        flowId.markerId,
        flowId.instanceKey,
        errorName,
        debugInfo,
      );
    }
  },

  endCancel(flowId: FlowId, cancelReason: string): void {
    if (global.nativeUserFlowEndCancel) {
      global.nativeUserFlowEndCancel(
        flowId.markerId,
        flowId.instanceKey,
        cancelReason,
      );
    }
  },
};

module.exports = UserFlow;
