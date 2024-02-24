
import * as strategies from '../src/strategies';
jest.useFakeTimers();

describe('strategies', () => {
    beforeEach(() => {
        jest.clearAllTimers();
    });
    describe('fallback', () => {
        it('should fall back to the provided strategy', () => {
            const fallback = strategies.fallback('nonexistent', strategies.nextTick);
            expect(fallback).toEqual(strategies.nextTick);
        });

        it('should log a warning', () => {
            const nonexistentStrategy = 'nonexistent';
            const fallbackStrategy = strategies.nextTick;
            const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });
            strategies.fallback(nonexistentStrategy, fallbackStrategy);
            expect(warnSpy).toHaveBeenCalledWith(`Strategy ${nonexistentStrategy} not found, falling back to ${fallbackStrategy.name} strategy.`);
        });
    })
    describe('nextTick', () => {
        it('should call the plugin function', () => {
            const pluginFn = jest.fn();
            strategies.nextTick(pluginFn);
            jest.runAllTimers();
            expect(pluginFn).toHaveBeenCalled();
        });
    });
    describe('immediate', () => {
        it('should call the plugin function', () => {
            const pluginFn = jest.fn();
            strategies.immediate(pluginFn);
            expect(pluginFn).toHaveBeenCalled();
        });
    });
    describe('hover', () => {
        describe('with a jQuery element', () => {
            it('should call the plugin function', () => {
                const pluginFn = jest.fn();
                const el = { jquery: true, one: jest.fn() };
                strategies.hover(pluginFn, el);
                expect(el.one).toHaveBeenCalledWith('mouseover', pluginFn);
            });
        });
        describe('with a DOM element', () => {
            it('should call the plugin function', () => {
                const pluginFn = jest.fn();
                const el = { addEventListener: jest.fn() };
                strategies.hover(pluginFn, el);
                expect(el.addEventListener).toHaveBeenCalledWith('mouseover', pluginFn, { once: true });
            });
        })
    });
})
