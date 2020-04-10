import { isVictory, isDraw } from './conditions';

describe('tic-tac-toe conditions', () => {
  describe('isVictory', () => {
    it('should return true for a victory', () => {
      expect(
        isVictory(['1', '1', '1', '0', '1', '0', '1', '0', '0'], '1'),
      ).toBe(true);

      expect(
        isVictory(['3', '7', '7', '3', '3', '3', '7', '3', '7'], '3'),
      ).toBe(true);

      expect(
        isVictory(['9', '1', '9', '1', '9', '0', '1', '1', '1'], '1'),
      ).toBe(true);

      expect(
        isVictory(['0', '1', '1', '1', '0', '0', '1', '1', '0'], '0'),
      ).toBe(true);

      expect(
        isVictory(['1', '0', '0', '0', '1', '1', '0', '0', '1'], '1'),
      ).toBe(true);

      expect(
        isVictory(['1', '1', '0', '0', '0', '1', '0', '1', '1'], '0'),
      ).toBe(true);

      expect(
        isVictory(['2', '1', '1', '1', '2', '1', '2', '1', '2'], '2'),
      ).toBe(true);
    });
  });

  describe('isDraw', () => {
    it('should return true for a draw', () => {
      expect(isDraw(['1', '0', '1', '1', '0', '0', '0', '1', '1'])).toBe(true);
    });

    it('should return false', () => {
      expect(isDraw([null, '0', '1', '1', '0', '0', '0', '1', '1'])).toBe(
        false,
      );
      expect(isDraw(Array(9).fill(null))).toBe(false);
    });
  });
});
