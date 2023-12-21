export function isRenderItem(obj) {
    return 'geometry' in obj && 'material' in obj
}

export function disposeMaterial(obj) {
    if (!isRenderItem(obj)) return

    // because obj.material can be a material or array of materials
    const materials = [].concat(obj.material)

    for (const material of materials) {
        material.dispose()
    }
}

export function disposeObject(obj) {
    if (!obj) return

    if (isRenderItem(obj)) {
        if (obj.geometry) obj.geometry.dispose()
        disposeMaterial(obj)
    }

    Promise.resolve().then(() => {
        // if we remove children in the same tick then we can't continue traversing,
        // so we defer to the next microtask
        obj.parent && obj.parent.remove(obj)
    })
}

export function disposeAll(obj) {
    obj.traverse(node => disposeObject(node))
}
