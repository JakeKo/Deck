import V from '@/utilities/Vector';

/**
 * Given the basePoint (from which position is determined), calculate it's destination after changing a graphic's dimensions.
 * Account for rotation by appending a correction vector to the natural translation of the base point.
 */
function correctForRotationWhenChangingDimensions({
    basePoint,
    initialDimensions,
    newDimensions,
    rotation
}: {
    basePoint: V;
    initialDimensions: V;
    newDimensions: V;
    rotation: number;
}): V {
    // Calculate the vector by which the center will naturally shift given the new dimensions
    const translation = initialDimensions.towards(newDimensions).scale(0.5);

    // Calculate the vector by which the center ~should~ shift if taking rotation into account
    const translationRotated = translation.rotate(rotation);

    // Calculate the distance between the two translations and add that to the provided origin
    const correctionTranslation = translation.towards(translationRotated);
    return basePoint.add(correctionTranslation);
}

export {
    correctForRotationWhenChangingDimensions
};
