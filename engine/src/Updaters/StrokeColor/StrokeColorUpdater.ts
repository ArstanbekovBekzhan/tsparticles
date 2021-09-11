import { Particle } from "../../Core/Particle";
import type { IDelta, IParticleUpdater, IParticleValueAnimation } from "../../Core/Interfaces";
import { randomInRange } from "../../Utils";
import type { IColorAnimation } from "../../Options/Interfaces/IColorAnimation";
import { AnimationStatus } from "../../Enums";

function updateColorValue(
    delta: IDelta,
    value: IParticleValueAnimation<number>,
    valueAnimation: IColorAnimation,
    max: number,
    decrease: boolean
): void {
    const colorValue = value;

    if (!colorValue || !colorValue.enable) {
        return;
    }

    const offset = randomInRange(valueAnimation.offset);
    const velocity = (value.velocity ?? 0) * delta.factor + offset * 3.6;

    if (!decrease || colorValue.status === AnimationStatus.increasing) {
        colorValue.value += velocity;

        if (decrease && colorValue.value > max) {
            colorValue.status = AnimationStatus.decreasing;
            colorValue.value -= colorValue.value % max;
        }
    } else {
        colorValue.value -= velocity;

        if (colorValue.value < 0) {
            colorValue.status = AnimationStatus.increasing;
            colorValue.value += colorValue.value;
        }
    }

    if (colorValue.value > max) {
        colorValue.value %= max;
    }
}

function updateStrokeColor(particle: Particle, delta: IDelta): void {
    if (!particle.stroke.color) {
        return;
    }

    const animationOptions = particle.stroke.color.animation;
    const h = particle.strokeColor?.h ?? particle.color?.h;

    if (h) {
        updateColorValue(delta, h, animationOptions.h, 360, false);
    }

    const s = particle.strokeColor?.s ?? particle.color?.s;

    if (s) {
        updateColorValue(delta, s, animationOptions.s, 100, true);
    }

    const l = particle.strokeColor?.l ?? particle.color?.l;

    if (l) {
        updateColorValue(delta, l, animationOptions.l, 100, true);
    }
}

export class StrokeColorUpdater implements IParticleUpdater {
    init(particle: Particle): void {
        // nothing
    }

    isEnabled(particle: Particle): boolean {
        const color = particle.stroke.color;

        return (
            !particle.destroyed &&
            !particle.spawning &&
            color !== undefined &&
            ((particle.strokeColor?.h.value !== undefined && color.animation.h.enable) ||
                (particle.strokeColor?.s.value !== undefined && color.animation.s.enable) ||
                (particle.strokeColor?.l.value !== undefined && color.animation.l.enable))
        );
    }

    update(particle: Particle, delta: IDelta): void {
        if (!this.isEnabled(particle)) {
            return;
        }

        updateStrokeColor(particle, delta);
    }
}
