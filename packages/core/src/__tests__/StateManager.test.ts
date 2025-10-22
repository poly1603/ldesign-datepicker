/**
 * StateManager 单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { StateManager } from '../architecture/StateManager';

interface TestState {
  count: number;
  name: string;
  nested: {
    value: number;
  };
}

describe('StateManager', () => {
  let stateManager: StateManager<TestState>;

  beforeEach(() => {
    stateManager = new StateManager({
      initialState: {
        count: 0,
        name: 'test',
        nested: { value: 1 },
      },
      enableTimeTravel: true,
      maxHistory: 10,
    });
  });

  describe('状态获取和设置', () => {
    it('应该返回初始状态', () => {
      const state = stateManager.getState();
      expect(state.count).toBe(0);
      expect(state.name).toBe('test');
      expect(state.nested.value).toBe(1);
    });

    it('应该正确更新状态', () => {
      stateManager.setState({ count: 1 });
      const state = stateManager.getState();
      expect(state.count).toBe(1);
    });

    it('应该支持函数式更新', () => {
      stateManager.setState((state) => ({
        ...state,
        count: state.count + 1,
      }));

      const state = stateManager.getState();
      expect(state.count).toBe(1);
    });
  });

  describe('不可变性', () => {
    it('返回的状态应该是冻结的', () => {
      const state = stateManager.getState();
      expect(Object.isFrozen(state)).toBe(true);
    });

    it('不应该允许直接修改状态', () => {
      const state = stateManager.getState();
      expect(() => {
        (state as any).count = 100;
      }).toThrow();
    });

    it('嵌套对象也应该是冻结的', () => {
      const state = stateManager.getState();
      expect(Object.isFrozen(state.nested)).toBe(true);
    });
  });

  describe('时间旅行', () => {
    it('应该支持撤销', () => {
      stateManager.setState({ count: 1 });
      stateManager.setState({ count: 2 });
      stateManager.setState({ count: 3 });

      stateManager.undo();
      expect(stateManager.getState().count).toBe(2);

      stateManager.undo();
      expect(stateManager.getState().count).toBe(1);
    });

    it('应该支持重做', () => {
      stateManager.setState({ count: 1 });
      stateManager.setState({ count: 2 });

      stateManager.undo();
      stateManager.redo();

      expect(stateManager.getState().count).toBe(2);
    });

    it('撤销后再设置新状态应该清除后续历史', () => {
      stateManager.setState({ count: 1 });
      stateManager.setState({ count: 2 });
      stateManager.setState({ count: 3 });

      stateManager.undo();
      stateManager.undo();

      stateManager.setState({ count: 10 });

      expect(stateManager.redo()).toBe(false);
      expect(stateManager.getState().count).toBe(10);
    });

    it('应该限制历史记录大小', () => {
      for (let i = 0; i < 20; i++) {
        stateManager.setState({ count: i });
      }

      const history = stateManager.getHistory();
      expect(history.length).toBeLessThanOrEqual(10);
    });
  });

  describe('订阅机制', () => {
    it('应该通知订阅者状态变更', () => {
      let called = false;
      let newCount = 0;

      stateManager.subscribe((newState, oldState) => {
        called = true;
        newCount = newState.count;
      });

      stateManager.setState({ count: 5 });

      expect(called).toBe(true);
      expect(newCount).toBe(5);
    });

    it('取消订阅后不应该收到通知', () => {
      let callCount = 0;

      const unsubscribe = stateManager.subscribe(() => {
        callCount++;
      });

      stateManager.setState({ count: 1 });
      expect(callCount).toBe(1);

      unsubscribe();

      stateManager.setState({ count: 2 });
      expect(callCount).toBe(1);
    });
  });

  describe('清理', () => {
    it('应该正确清理资源', () => {
      stateManager.setState({ count: 1 });
      stateManager.setState({ count: 2 });

      stateManager.destroy();

      expect(stateManager.getHistory().length).toBe(0);
    });
  });
});

