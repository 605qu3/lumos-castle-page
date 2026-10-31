/* shell-things-3.js: floor 3's Pass 2.4 placements (objects placed in the shell), written only by this floor's tool
   (tools/floor_things_file.py); never edit by hand. Each block adds one room to SHELL_W5A.things. */
(function (T) {
  var things = {
    /* 3-THINGS lake-tower-3 */
    /* docs/interiors/upper-floors-completion-1029.md (B2, lake-tower-3): the watch's winter store: two book crates of tied logs, a boarded chest of oil, wicks and rope, two sacks of salt or meal against the south-west face, a school trunk with a keeper's coat, an unlit hanging lantern over the middle; nothing within 1.2 of the door, the middle clear to 3.0 */
    'lake-tower-3': { items: [
      ['b', 125.7, -4.85, 0.0, 126.3, -3.95, 0.35, 'pine'], ['b', 125.695, -4.855, 0.1, 126.305, -3.945, 0.14, 'wood'], ['b', 125.73, -4.82, 0.35, 126.27, -3.98, 0.45, 'books'], ['b', 125.72, -4.82, 0.35, 126.28, -3.98, 0.7, 'pine'],
      ['b', 125.715, -4.825, 0.45, 126.285, -3.975, 0.49, 'wood'], ['b', 125.75, -4.79, 0.7, 126.25, -4.01, 0.8, 'books'], ['b', 133.45, -4.85, 0, 133.95, -3.95, 0.5, 'deal'], ['b', 133.44, -4.86, 0.5, 133.96, -3.94, 0.55, 'pine'],
      ['b', 133.57, -4.862, 0, 133.61, -3.938, 0.55, 'iron'], ['b', 133.79, -4.862, 0, 133.83, -3.938, 0.55, 'iron'], ['b', 133.67, -4.865, 0.4, 133.73, -4.84, 0.56, 'iron'], ['b', 133.67, -3.96, 0.4, 133.73, -3.935, 0.56, 'iron'],
      ['y', 127.1, -6.7, 0.24, 0, 0.525, 'canvas'], ['y', 127.1, -6.7, 0.18, 0.525, 0.7, 'canvas'], ['y', 127.1, -6.7, 0.187, 0.434, 0.462, 'rope'], ['y', 127.6, -6.5, 0.24, 0, 0.465, 'canvas'],
      ['y', 127.6, -6.5, 0.18, 0.465, 0.62, 'canvas'], ['y', 127.6, -6.5, 0.187, 0.384, 0.409, 'rope'], ['b', 132.45, -7.05, 0, 132.95, -6.15, 0.34, 'leather'], ['b', 132.45, -7.03, 0.34, 132.95, -6.17, 0.46, 'leather'],
      ['b', 132.49, -6.99, 0.46, 132.91, -6.21, 0.5, 'leather'], ['b', 132.442, -7.058, 0, 132.49, -7.01, 0.12, 'brass'], ['b', 132.442, -6.19, 0, 132.49, -6.142, 0.12, 'brass'], ['b', 132.91, -7.058, 0, 132.958, -7.01, 0.12, 'brass'],
      ['b', 132.91, -6.19, 0, 132.958, -6.142, 0.12, 'brass'], ['b', 132.66, -7.06, 0.3, 132.74, -7.04, 0.4, 'brass'], ['b', 132.66, -6.16, 0.3, 132.74, -6.14, 0.4, 'brass'], ['y', 130.0, -4.45, 0.02, 2.0, 2.5, 'iron'],
      ['y', 130.0, -4.45, 0.12, 1.75, 2.0, 'glass']] },
    /* 3-THINGS end lake-tower-3 */
    /* 3-THINGS drum-room-3 */
    /* docs/interiors/upper-floors-completion-1029.md (B1, drum-room-3): the common room's broken chairs put away: three oak chairs tipped and nested with the lamed one's leg beside it, a chintz armchair with a split arm, a joined table with two stools legs up, a leather armchair cracked across the seat, two hall chairs leaning together, four squab cushions under a dust sheet; luggage tags "to be mended" as cards; inside r 4.3, the door walk clear; nothing on the outer wall; the stack of tipped chairs is lower than the schedule's 0.9 */
    'drum-room-3': { items: [
      ['b', 38.48, 2.39, 0.0, 38.92, 2.81, 0.04, 'oak'], ['b', 38.48, 2.39, 0.04, 38.52, 2.81, 0.46, 'oak'], ['b', 38.52, 2.41, 0.04, 38.9, 2.45, 0.08, 'oak'], ['b', 38.52, 2.75, 0.04, 38.9, 2.79, 0.08, 'oak'],
      ['b', 38.52, 2.39, 0.04, 38.96, 2.81, 0.08, 'oak'], ['b', 38.52, 2.39, 0.08, 38.56, 2.81, 0.5, 'oak'], ['b', 38.56, 2.41, 0.08, 38.94, 2.45, 0.12, 'oak'], ['b', 38.56, 2.75, 0.08, 38.94, 2.79, 0.12, 'oak'],
      ['b', 38.56, 2.39, 0.08, 39.0, 2.81, 0.12, 'oak'], ['b', 38.56, 2.39, 0.12, 38.6, 2.81, 0.54, 'oak'], ['b', 38.6, 2.41, 0.12, 38.98, 2.45, 0.16, 'oak'], ['b', 38.6, 2.75, 0.12, 38.98, 2.79, 0.16, 'oak'],
      ['b', 38.35, 3.25, 0, 38.95, 3.31, 0.05, 'oak'], ['b', 38.66, 2.397, 0.14, 38.74, 2.403, 0.21, 'paper'], ['b', 39.58, 4.15, 0, 40.42, 5.05, 0.4, 'leather'], ['b', 39.78, 4.27, 0.4, 40.42, 4.93, 0.48, 'dark'],
      ['b', 39.58, 4.15, 0.4, 39.78, 5.05, 1.0, 'leather'], ['b', 39.78, 4.15, 0.4, 40.42, 4.27, 0.62, 'leather'], ['b', 39.78, 4.93, 0.4, 40.42, 5.05, 0.62, 'leather'], ['b', 40.1, 4.13, 0.62, 40.34, 4.18, 0.64, 'dark'],
      ['b', 39.56, 4.147, 0.55, 39.64, 4.153, 0.62, 'paper'], ['t', 45.05, 1.4, 45.75, 3.0, 0.75, 'oak'], ['b', 45.39, 1.4, 0.74, 45.41, 3.0, 0.76, 'dark'], ['b', 45.2, 1.65, 0.75, 45.6, 1.95, 0.79, 'oak'],
      ['b', 45.22, 1.67, 0.79, 45.26, 1.71, 1.2, 'oak'], ['b', 45.54, 1.67, 0.79, 45.58, 1.71, 1.2, 'oak'], ['b', 45.22, 1.89, 0.79, 45.26, 1.93, 1.2, 'oak'], ['b', 45.54, 1.89, 0.79, 45.58, 1.93, 1.2, 'oak'],
      ['b', 45.2, 2.45, 0.75, 45.6, 2.75, 0.79, 'oak'], ['b', 45.22, 2.47, 0.79, 45.26, 2.51, 1.2, 'oak'], ['b', 45.54, 2.47, 0.79, 45.58, 2.51, 1.2, 'oak'], ['b', 45.22, 2.69, 0.79, 45.26, 2.73, 1.2, 'oak'],
      ['b', 45.54, 2.69, 0.79, 45.58, 2.73, 1.2, 'oak'], ['b', 41.74, -2.12, 0, 42.64, -1.28, 0.4, 'leather'], ['b', 41.86, -2.12, 0.4, 42.52, -1.48, 0.48, 'dark'], ['b', 41.74, -1.48, 0.4, 42.64, -1.28, 1.0, 'leather'],
      ['b', 41.74, -2.12, 0.4, 41.86, -1.48, 0.62, 'leather'], ['b', 42.52, -2.12, 0.4, 42.64, -1.48, 0.62, 'leather'], ['b', 41.9, -1.75, 0.48, 42.5, -1.71, 0.495, 'dark'], ['t', 44.19, 3.79, 44.61, 4.21, 0.45, 'oak'],
      ['b', 44.57, 3.79, 0.45, 44.61, 4.21, 0.9, 'oak'], ['t', 44.64, 4.19, 45.06, 4.61, 0.45, 'oak'], ['b', 44.64, 4.19, 0.45, 44.68, 4.61, 0.9, 'oak'], ['b', 39.25, -0.75, 0.0, 39.95, -0.05, 0.1, 'scarlet'],
      ['b', 39.25, -0.75, 0.1, 39.95, -0.05, 0.2, 'blue'], ['b', 39.25, -0.75, 0.2, 39.95, -0.05, 0.3, 'green'], ['b', 39.25, -0.75, 0.3, 39.95, -0.05, 0.4, 'scarlet'], ['b', 39.2, -0.8, 0.4, 40.0, 0.0, 0.43, 'linen'],
      ['b', 39.2, -0.8, 0.0, 39.24, 0.0, 0.43, 'linen']] },
    /* 3-THINGS end drum-room-3 */
    /* 3-THINGS headmasters-tower-room-3 */
    /* docs/interiors/upper-floors-gaps-1028.md (headmasters-tower-room-3, round book stores, polygon-rooms-1029.md): 14 places round the curve (bookcases on the cardinal arcs, book crates between, every second stacked two high, one place in four bare), the door's arc kept clear 1.0 either side; the ladder is a plain placeholder board at the arc furthest from the door (a gap, Objects) */
    'headmasters-tower-room-3': { items: [
      ['b', 162.806, 42.433, 0, 163.306, 42.833, 0.4, 'deal'], ['b', 162.856, 42.483, 0.4, 163.256, 42.783, 0.43, 'paper'], ['b', 162.806, 42.433, 0.43, 163.306, 42.833, 0.83, 'deal'], ['b', 163.713, 43.184, 0, 164.213, 43.584, 0.4, 'deal'],
      ['b', 163.763, 43.234, 0.4, 164.163, 43.534, 0.43, 'paper'], ['b', 164.801, 43.634, 0, 165.301, 44.034, 0.4, 'deal'], ['b', 164.851, 43.684, 0.4, 165.251, 43.984, 0.43, 'paper'], ['b', 164.801, 43.634, 0.43, 165.301, 44.034, 0.83, 'deal'],
      ['s', 165.5, 44.084, 166.5, 44.384, [0.35, 0.7, 1.05, 1.4, 1.75, 2.1], 'oak'], ['b', 167.126, 43.503, 0, 167.626, 43.903, 0.4, 'deal'], ['b', 167.176, 43.553, 0.4, 167.576, 43.853, 0.43, 'paper'], ['b', 167.126, 43.503, 0.43, 167.626, 43.903, 0.83, 'deal'],
      ['b', 168.156, 42.933, 0, 168.656, 43.333, 0.4, 'deal'], ['b', 168.206, 42.983, 0.4, 168.606, 43.283, 0.43, 'paper'], ['b', 168.972, 42.084, 0, 169.472, 42.484, 0.4, 'deal'], ['b', 169.022, 42.134, 0.4, 169.422, 42.434, 0.43, 'paper'],
      ['b', 168.972, 42.084, 0.43, 169.472, 42.484, 0.83, 'deal'], ['s', 170.084, 39.5, 170.384, 40.5, [0.35, 0.7, 1.05, 1.4, 1.75, 2.1], 'oak'], ['b', 169.054, 37.635, 0, 169.554, 38.035, 0.4, 'deal'], ['b', 169.104, 37.685, 0.4, 169.504, 37.985, 0.43, 'paper'],
      ['b', 169.054, 37.635, 0.43, 169.554, 38.035, 0.83, 'deal'], ['b', 167.26, 36.15, 0, 167.76, 36.55, 0.4, 'deal'], ['b', 167.31, 36.2, 0.4, 167.71, 36.5, 0.43, 'paper'], ['b', 167.26, 36.15, 0.43, 167.76, 36.55, 0.83, 'deal'],
      ['s', 165.5, 35.616, 166.5, 35.916, [0.35, 0.7, 1.05, 1.4, 1.75, 2.1], 'oak'], ['b', 164.942, 35.934, 0, 165.442, 36.334, 0.4, 'deal'], ['b', 164.992, 35.984, 0.4, 165.392, 36.284, 0.43, 'paper'], ['b', 164.942, 35.934, 0.43, 165.442, 36.334, 0.83, 'deal'],
      ['b', 162.904, 37.061, 0, 163.404, 37.461, 0.4, 'deal'], ['b', 162.954, 37.111, 0.4, 163.354, 37.411, 0.43, 'paper'], ['b', 162.904, 37.061, 0.43, 163.404, 37.461, 0.83, 'deal'], ['b', 162.223, 38.021, 0, 162.723, 38.421, 0.4, 'deal'],
      ['b', 162.273, 38.071, 0.4, 162.673, 38.371, 0.43, 'paper'], ['b', 169.834, 39.168, 0, 170.234, 39.218, 2.4, 'wood']] },
    /* 3-THINGS end headmasters-tower-room-3 */
    /* 3-THINGS ravenclaw-tower-room-3 */
    /* docs/interiors/upper-floors-gaps-1028.md (ravenclaw-tower-room-3, round book stores, polygon-rooms-1029.md): 25 places round the curve (bookcases on the cardinal arcs, book crates between, every second stacked two high, one place in four bare), the door's arc kept clear 1.0 either side, a worktable north of the middle; the ladder is a plain placeholder board at the arc furthest from the door (a gap, Objects) */
    'ravenclaw-tower-room-3': { items: [
      ['s', -0.965, 33.5, -0.665, 34.5, [0.35, 0.7, 1.05, 1.4, 1.75, 2.1], 'oak'], ['b', -1.657, 31.685, 0, -1.157, 32.085, 0.4, 'deal'], ['b', -1.607, 31.735, 0.4, -1.207, 32.035, 0.43, 'paper'], ['b', -2.149, 30.601, 0, -1.649, 31.001, 0.4, 'deal'],
      ['b', -2.099, 30.651, 0.4, -1.699, 30.951, 0.43, 'paper'], ['b', -2.149, 30.601, 0.43, -1.649, 31.001, 0.83, 'deal'], ['b', -3.683, 28.794, 0, -3.183, 29.194, 0.4, 'deal'], ['b', -3.633, 28.844, 0.4, -3.233, 29.144, 0.43, 'paper'],
      ['b', -3.683, 28.794, 0.43, -3.183, 29.194, 0.83, 'deal'], ['b', -4.672, 28.132, 0, -4.172, 28.532, 0.4, 'deal'], ['b', -4.622, 28.182, 0.4, -4.222, 28.482, 0.43, 'paper'], ['b', -5.766, 27.663, 0, -5.266, 28.063, 0.4, 'deal'],
      ['b', -5.716, 27.713, 0.4, -5.316, 28.013, 0.43, 'paper'], ['b', -5.766, 27.663, 0.43, -5.266, 28.063, 0.83, 'deal'], ['s', -8.0, 27.165, -7.0, 27.465, [0.35, 0.7, 1.05, 1.4, 1.75, 2.1], 'oak'], ['b', -8.117, 27.36, 0, -7.617, 27.76, 0.4, 'deal'],
      ['b', -8.067, 27.41, 0.4, -7.667, 27.71, 0.43, 'paper'], ['b', -8.117, 27.36, 0.43, -7.617, 27.76, 0.83, 'deal'], ['b', -9.294, 27.537, 0, -8.794, 27.937, 0.4, 'deal'], ['b', -9.244, 27.587, 0.4, -8.844, 27.887, 0.43, 'paper'],
      ['b', -10.418, 27.928, 0, -9.918, 28.328, 0.4, 'deal'], ['b', -10.368, 27.978, 0.4, -9.968, 28.278, 0.43, 'paper'], ['b', -10.418, 27.928, 0.43, -9.918, 28.328, 0.83, 'deal'], ['b', -12.359, 29.288, 0, -11.859, 29.688, 0.4, 'deal'],
      ['b', -12.309, 29.338, 0.4, -11.909, 29.638, 0.43, 'paper'], ['b', -12.359, 29.288, 0.43, -11.859, 29.688, 0.83, 'deal'], ['b', -13.11, 30.212, 0, -12.61, 30.612, 0.4, 'deal'], ['b', -13.06, 30.262, 0.4, -12.66, 30.562, 0.43, 'paper'],
      ['b', -13.678, 31.258, 0, -13.178, 31.658, 0.4, 'deal'], ['b', -13.628, 31.308, 0.4, -13.228, 31.608, 0.43, 'paper'], ['b', -13.678, 31.258, 0.43, -13.178, 31.658, 0.83, 'deal'], ['s', -14.335, 33.5, -14.035, 34.5, [0.35, 0.7, 1.05, 1.4, 1.75, 2.1], 'oak'],
      ['b', -14.128, 34.759, 0, -13.628, 35.159, 0.4, 'deal'], ['b', -14.078, 34.809, 0.4, -13.678, 35.109, 0.43, 'paper'], ['b', -13.843, 35.915, 0, -13.343, 36.315, 0.4, 'deal'], ['b', -13.793, 35.965, 0.4, -13.393, 36.265, 0.43, 'paper'],
      ['b', -13.843, 35.915, 0.43, -13.343, 36.315, 0.83, 'deal'], ['b', -12.668, 37.973, 0, -12.168, 38.373, 0.4, 'deal'], ['b', -12.618, 38.023, 0.4, -12.218, 38.323, 0.43, 'paper'], ['b', -12.668, 37.973, 0.43, -12.168, 38.373, 0.83, 'deal'],
      ['b', -11.817, 38.806, 0, -11.317, 39.206, 0.4, 'deal'], ['b', -11.767, 38.856, 0.4, -11.367, 39.156, 0.43, 'paper'], ['b', -10.828, 39.468, 0, -10.328, 39.868, 0.4, 'deal'], ['b', -10.778, 39.518, 0.4, -10.378, 39.818, 0.43, 'paper'],
      ['b', -10.828, 39.468, 0.43, -10.328, 39.868, 0.83, 'deal'], ['s', -8.0, 40.535, -7.0, 40.835, [0.35, 0.7, 1.05, 1.4, 1.75, 2.1], 'oak'], ['b', -7.383, 40.24, 0, -6.883, 40.64, 0.4, 'deal'], ['b', -7.333, 40.29, 0.4, -6.933, 40.59, 0.43, 'paper'],
      ['b', -6.206, 40.063, 0, -5.706, 40.463, 0.4, 'deal'], ['b', -6.156, 40.113, 0.4, -5.756, 40.413, 0.43, 'paper'], ['b', -6.206, 40.063, 0.43, -5.706, 40.463, 0.83, 'deal'], ['b', -4.048, 39.082, 0, -3.548, 39.482, 0.4, 'deal'],
      ['b', -3.998, 39.132, 0.4, -3.598, 39.432, 0.43, 'paper'], ['b', -4.048, 39.082, 0.43, -3.548, 39.482, 0.83, 'deal'], ['b', -3.141, 38.312, 0, -2.641, 38.712, 0.4, 'deal'], ['b', -3.091, 38.362, 0.4, -2.691, 38.662, 0.43, 'paper'],
      ['b', -2.39, 37.388, 0, -1.89, 37.788, 0.4, 'deal'], ['b', -2.34, 37.438, 0.4, -1.94, 37.738, 0.43, 'paper'], ['b', -2.39, 37.388, 0.43, -1.89, 37.788, 0.83, 'deal'], ['b', -14.16, 32.801, 0, -13.76, 32.851, 2.4, 'wood'],
      ['t', -8.3, 36.0, -6.7, 36.8, 0.76, 'oak'], ['b', -7.8, 36.2, 0.76, -7.3, 36.55, 0.8, 'paper']] },
    /* 3-THINGS end ravenclaw-tower-room-3 */
    /* 3-THINGS staff-bedrooms-3-lake-nook */
    /* docs/interiors/upper-floors-gaps-1028.md (staff-bedrooms-3-lake-nook, staff bedrooms): a wardrobe on the north wall, a washstand on the south, the way from the storeroom door to the bedrooms clear; a worn threshold */
    'staff-bedrooms-3-lake-nook': { items: [
      ['b', 49.85, 11.83, 0, 50.95, 12.4, 2.0, 'oak'], ['b', 50.39, 11.83, 0.05, 50.41, 12.42, 1.95, 'dark'], ['b', 50.05, 17.6, 0, 50.6, 18.02, 0.85, 'oak'], ['b', 50.04, 17.58, 0.85, 50.61, 18.02, 0.88, 'stone'],
      ['y', 50.325, 17.8, 0.17, 0.88, 0.94, 'white'], ['b', 48.83, 14.35, 0, 49.05, 15.25, 0.012, 'stone']] },
    /* 3-THINGS end staff-bedrooms-3-lake-nook */
    /* 3-THINGS swivelling-staircase-room-3 */
    /* docs/interiors/upper-floors-gaps-1028.md (swivelling-staircase-room-3, the swivelling staircase, the room it turns in): the stair hall's forms (stair-hall.md, torches in brackets): a worn threshold and 2 unlit torch brackets on the side walls; nothing on the stair's path, the floor bare */
    'swivelling-staircase-room-3': { items: [
      ['b', 57.75, 59.23, 0, 58.65, 59.45, 0.012, 'stone'], ['b', 50.63, 65.905, 2.15, 50.93, 65.945, 2.2, 'iron'], ['y', 50.91, 65.925, 0.05, 2.2, 2.32, 'iron'], ['b', 65.47, 65.905, 2.15, 65.77, 65.945, 2.2, 'iron'],
      ['y', 65.49, 65.925, 0.05, 2.2, 2.32, 'iron']] },
    /* 3-THINGS end swivelling-staircase-room-3 */
    /* 3-THINGS astronomy-stair-foot-3 */
    /* docs/interiors/upper-floors-gaps-1028.md (astronomy-stair-foot-3, tower stair feet and lobbies): a worn stone threshold at the door and one unlit torch bracket; the stair runner and treads are the tower stair's, not this room's, so none is laid here */
    'astronomy-stair-foot-3': { items: [
      ['b', 84.55, 59.23, 0, 85.45, 59.45, 0.012, 'stone'], ['b', 82.23, 64.28, 2.15, 82.53, 64.32, 2.2, 'iron'], ['y', 82.51, 64.3, 0.05, 2.2, 2.32, 'iron']] },
    /* 3-THINGS end astronomy-stair-foot-3 */
    /* 3-THINGS drum-bend-3-east */
    /* docs/interiors/upper-floors-gaps-1028.md (drum-bend-3-east, corridors and passages): bare flags, a worn stone threshold at each door, one unlit torch bracket clear of every opening */
    'drum-bend-3-east': { items: [
      ['b', 50.37, 11.07, 2.15, 50.41, 11.37, 2.2, 'iron'], ['y', 50.39, 11.09, 0.05, 2.2, 2.32, 'iron']] },
    /* 3-THINGS end drum-bend-3-east */
    /* 3-THINGS drum-bend-3 */
    /* docs/interiors/upper-floors-gaps-1028.md (drum-bend-3, corridors and passages): bare flags, a worn stone threshold at each door, one unlit torch bracket clear of every opening */
    'drum-bend-3': { items: [
      ['b', 41.75, 11.15, 0, 42.65, 11.37, 0.012, 'stone'], ['b', 42.02, 8.58, 2.15, 42.06, 8.88, 2.2, 'iron'], ['y', 42.04, 8.86, 0.05, 2.2, 2.32, 'iron']] },
    /* 3-THINGS end drum-bend-3 */
    /* 3-THINGS drum-bend-3-west */
    /* docs/interiors/upper-floors-gaps-1028.md (drum-bend-3-west, corridors and passages): bare flags, a worn stone threshold at each door, one unlit torch bracket clear of every opening */
    'drum-bend-3-west': { items: [
      ['b', 33.02, 7.88, 2.15, 33.32, 7.92, 2.2, 'iron'], ['y', 33.3, 7.9, 0.05, 2.2, 2.32, 'iron']] },
    /* 3-THINGS end drum-bend-3-west */
    /* 3-THINGS west-wing-corridor-3 */
    /* docs/interiors/upper-floors-gaps-1028.md (west-wing-corridor-3, corridors and passages): bare flags, a worn stone threshold at each door, one unlit torch bracket clear of every opening */
    'west-wing-corridor-3': { items: [
      ['b', 13.45, 44.23, 0, 14.35, 44.45, 0.012, 'stone'], ['b', 12.63, 47.28, 2.15, 12.93, 47.32, 2.2, 'iron'], ['y', 12.91, 47.3, 0.05, 2.2, 2.32, 'iron']] },
    /* 3-THINGS end west-wing-corridor-3 */
    /* 3-THINGS west-cross-corridor-3-end */
    /* docs/interiors/upper-floors-gaps-1028.md (west-cross-corridor-3-end, corridors and passages): bare flags, a worn stone threshold at each door, one unlit torch bracket clear of every opening */
    'west-cross-corridor-3-end': { items: [
      ['b', 4.55, 51.65, 0, 4.77, 52.55, 0.012, 'stone'], ['b', 2.055, 50.83, 2.15, 2.095, 51.13, 2.2, 'iron'], ['y', 2.075, 51.11, 0.05, 2.2, 2.32, 'iron']] },
    /* 3-THINGS end west-cross-corridor-3-end */
    /* 3-THINGS west-cross-corridor-3 */
    /* docs/interiors/upper-floors-gaps-1028.md (west-cross-corridor-3, corridors and passages): bare flags, a worn stone threshold at each door, one unlit torch bracket clear of every opening */
    'west-cross-corridor-3': { items: [
      ['b', 11.63, 51.65, 0, 11.85, 52.55, 0.012, 'stone'], ['b', 13.88, 53.07, 2.15, 13.92, 53.37, 2.2, 'iron'], ['y', 13.9, 53.09, 0.05, 2.2, 2.32, 'iron']] },
    /* 3-THINGS end west-cross-corridor-3 */
    /* 3-THINGS right-hand-corridor-3 */
    /* docs/interiors/upper-floors-gaps-1028.md (right-hand-corridor-3, corridors and passages): bare flags, a worn stone threshold at each door, one unlit torch bracket clear of every opening */
    'right-hand-corridor-3': { items: [
      ['b', 155.55, 49.55, 0, 156.45, 49.77, 0.012, 'stone'], ['b', 159.8, 40.55, 0, 160.02, 41.45, 0.012, 'stone'], ['b', 159.72, 35.68, 2.15, 160.02, 35.72, 2.2, 'iron'], ['y', 159.74, 35.7, 0.05, 2.2, 2.32, 'iron']] },
    /* 3-THINGS end right-hand-corridor-3 */
    /* 3-THINGS east-corridor-3-north */
    /* docs/interiors/upper-floors-gaps-1028.md (east-corridor-3-north, corridors and passages): bare flags, a worn stone threshold at each door, one unlit torch bracket clear of every opening */
    'east-corridor-3-north': { items: [
      ['b', 147.15, 19.8, 0, 147.37, 20.7, 0.012, 'stone'], ['b', 145.65, 18.23, 0, 146.55, 18.45, 0.012, 'stone'], ['b', 144.83, 20.38, 2.15, 145.13, 20.42, 2.2, 'iron'], ['y', 145.11, 20.4, 0.05, 2.2, 2.32, 'iron']] },
    /* 3-THINGS end east-corridor-3-north */
    /* 3-THINGS service-passage-3-lobby */
    /* docs/interiors/upper-floors-gaps-1028.md (service-passage-3-lobby, corridors and passages): bare flags, a worn stone threshold at each door, one unlit torch bracket clear of every opening */
    'service-passage-3-lobby': { items: [
      ['b', 68.8, 53.83, 0, 69.7, 54.05, 0.012, 'stone'], ['b', 68.63, 55.3, 0, 68.85, 56.1, 0.012, 'stone'], ['b', 69.57, 55.667, 2.15, 69.87, 55.708, 2.2, 'iron'], ['y', 69.59, 55.688, 0.05, 2.2, 2.32, 'iron']] },
    /* 3-THINGS end service-passage-3-lobby */
    /* 3-THINGS passage-3-west */
    /* docs/interiors/upper-floors-gaps-1028.md (passage-3-west, corridors and passages): bare flags, a worn stone threshold at each door, one unlit torch bracket clear of every opening */
    'passage-3-west': { items: [
      ['b', 23.45, 54.13, 0, 24.65, 54.35, 0.012, 'stone'], ['b', 23.23, 56.13, 2.15, 23.53, 56.17, 2.2, 'iron'], ['y', 23.51, 56.15, 0.05, 2.2, 2.32, 'iron']] },
    /* 3-THINGS end passage-3-west */
    /* 3-THINGS passage-3-study */
    /* docs/interiors/upper-floors-gaps-1028.md (passage-3-study, corridors and passages): bare flags, a worn stone threshold at each door, one unlit torch bracket clear of every opening */
    'passage-3-study': { items: [
      ['b', 87.45, 53.83, 0, 88.65, 54.05, 0.012, 'stone'], ['b', 87.23, 55.98, 2.15, 87.53, 56.02, 2.2, 'iron'], ['y', 87.51, 56.0, 0.05, 2.2, 2.32, 'iron']] },
    /* 3-THINGS end passage-3-study */
    /* 3-THINGS passage-3-middle */
    /* docs/interiors/upper-floors-gaps-1028.md (passage-3-middle, corridors and passages): bare flags, a worn stone threshold at each door, one unlit torch bracket clear of every opening */
    'passage-3-middle': { items: [
      ['b', 70.45, 53.83, 0, 71.65, 54.05, 0.012, 'stone'], ['b', 70.23, 55.98, 2.15, 70.53, 56.02, 2.2, 'iron'], ['y', 70.51, 56.0, 0.05, 2.2, 2.32, 'iron']] },
    /* 3-THINGS end passage-3-middle */
    /* 3-THINGS passage-3-charms */
    /* docs/interiors/upper-floors-gaps-1028.md (passage-3-charms, corridors and passages): bare flags, a worn stone threshold at each door, one unlit torch bracket clear of every opening */
    'passage-3-charms': { items: [
      ['b', 112.0, 53.63, 0, 113.2, 53.85, 0.012, 'stone'], ['b', 111.83, 55.88, 2.15, 112.13, 55.92, 2.2, 'iron'], ['y', 112.11, 55.9, 0.05, 2.2, 2.32, 'iron']] },
    /* 3-THINGS end passage-3-charms */
    /* 3-THINGS north-corridor-3-link */
    /* docs/interiors/upper-floors-gaps-1028.md (north-corridor-3-link, corridors and passages): bare flags, a worn stone threshold at each door, one unlit torch bracket clear of every opening */
    'north-corridor-3-link': { items: [
      ['b', 70.45, 53.15, 0, 71.65, 53.37, 0.012, 'stone'], ['b', 87.45, 53.15, 0, 88.65, 53.37, 0.012, 'stone'], ['b', 68.8, 53.15, 0, 69.7, 53.37, 0.012, 'stone'], ['b', 72.505, 50.83, 2.15, 72.545, 51.13, 2.2, 'iron'],
      ['y', 72.525, 51.11, 0.05, 2.2, 2.32, 'iron']] },
    /* 3-THINGS end north-corridor-3-link */
    /* 3-THINGS lake-corridor-3-west */
    /* docs/interiors/upper-floors-gaps-1028.md (lake-corridor-3-west, corridors and passages): bare flags, a worn stone threshold at each door, one unlit torch bracket clear of every opening */
    'lake-corridor-3-west': { items: [
      ['b', 13.745, 3.15, 0, 14.645, 3.37, 0.012, 'stone'], ['b', 28.14, 3.15, 0, 29.04, 3.37, 0.012, 'stone'], ['b', 6.7, 0.83, 0, 7.5, 1.05, 0.012, 'stone'], ['b', 35.26, 1.78, 2.15, 35.56, 1.82, 2.2, 'iron'],
      ['y', 35.28, 1.8, 0.05, 2.2, 2.32, 'iron']] },
    /* 3-THINGS end lake-corridor-3-west */
    /* 3-THINGS lake-corridor-3-mid */
    /* docs/interiors/upper-floors-gaps-1028.md (lake-corridor-3-mid, corridors and passages): bare flags, a worn stone threshold at each door, one unlit torch bracket clear of every opening */
    'lake-corridor-3-mid': { items: [
      ['b', 57.85, 3.15, 0, 58.75, 3.37, 0.012, 'stone'], ['b', 48.82, 1.78, 2.15, 49.12, 1.82, 2.2, 'iron'], ['y', 49.1, 1.8, 0.05, 2.2, 2.32, 'iron']] },
    /* 3-THINGS end lake-corridor-3-mid */
    /* 3-THINGS elves-linen-room-3-middle */
    /* docs/interiors/elves-linen-room.md, upper-floors-gaps-1028.md (elves-linen-room-3-middle, the house-elves' linen rooms): linen presses with folded linen, a stone sink, a pail and a sack of laundry; the elves' own things stay with floor B */
    'elves-linen-room-3-middle': { items: [
      ['s', 106.75, 53.83, 110.95, 54.4, [0.4, 0.8, 1.2, 1.6, 2.0], 'oak'], ['b', 110.37, 53.87, 0.4, 110.88, 54.33, 0.56, 'linen'], ['b', 110.37, 53.87, 0.8, 110.88, 54.33, 0.92, 'white'], ['b', 110.37, 53.87, 1.2, 110.88, 54.33, 1.4, 'linen'],
      ['b', 110.37, 53.87, 1.6, 110.88, 54.33, 1.72, 'white'], ['b', 109.67, 53.87, 0.4, 110.18, 54.33, 0.56, 'linen'], ['b', 109.67, 53.87, 0.8, 110.18, 54.33, 0.92, 'white'], ['b', 109.67, 53.87, 1.2, 110.18, 54.33, 1.4, 'linen'],
      ['b', 109.67, 53.87, 1.6, 110.18, 54.33, 1.72, 'white'], ['b', 108.97, 53.87, 0.4, 109.48, 54.33, 0.56, 'linen'], ['b', 108.97, 53.87, 0.8, 109.48, 54.33, 0.92, 'white'], ['b', 108.97, 53.87, 1.2, 109.48, 54.33, 1.4, 'linen'],
      ['b', 108.97, 53.87, 1.6, 109.48, 54.33, 1.72, 'white'], ['b', 108.27, 53.87, 0.4, 108.78, 54.33, 0.56, 'linen'], ['b', 108.27, 53.87, 0.8, 108.78, 54.33, 0.92, 'white'], ['b', 108.27, 53.87, 1.2, 108.78, 54.33, 1.4, 'linen'],
      ['b', 108.27, 53.87, 1.6, 108.78, 54.33, 1.72, 'white'], ['b', 107.57, 53.87, 0.4, 108.08, 54.33, 0.56, 'linen'], ['b', 107.57, 53.87, 0.8, 108.08, 54.33, 0.92, 'white'], ['b', 107.57, 53.87, 1.2, 108.08, 54.33, 1.4, 'linen'],
      ['b', 107.57, 53.87, 1.6, 108.08, 54.33, 1.72, 'white'], ['b', 106.87, 53.87, 0.4, 107.38, 54.33, 0.56, 'linen'], ['b', 106.87, 53.87, 0.8, 107.38, 54.33, 0.92, 'white'], ['b', 106.87, 53.87, 1.2, 107.38, 54.33, 1.4, 'linen'],
      ['b', 106.87, 53.87, 1.6, 107.38, 54.33, 1.72, 'white'], ['b', 105.35, 53.83, 0, 106.45, 54.4, 0.85, 'stone'], ['b', 105.5, 53.83, 0.85, 106.3, 54.35, 0.9, 'white'], ['b', 105.91, 53.83, 0.9, 105.95, 53.91, 1.05, 'brass'],
      ['y', 111.0, 55.65, 0.17, 0, 0.35, 'wood'], ['y', 110.9, 54.95, 0.25, 0, 0.7, 'canvas'], ['b', 107.35, 57.35, 0, 108.25, 57.57, 0.012, 'stone']] },
    /* 3-THINGS end elves-linen-room-3-middle */
    /* 3-THINGS elves-linen-room-3-east */
    /* docs/interiors/elves-linen-room.md, upper-floors-gaps-1028.md (elves-linen-room-3-east, the house-elves' linen rooms): linen presses with folded linen, a stone sink, a pail and a sack of laundry, a pulley airer with linen drying; the elves' own things stay with floor B */
    'elves-linen-room-3-east': { items: [
      ['s', 159.45, 13.15, 160.02, 17.35, [0.4, 0.8, 1.2, 1.6, 2.0], 'oak'], ['b', 159.52, 16.77, 0.4, 159.98, 17.28, 0.56, 'linen'], ['b', 159.52, 16.77, 0.8, 159.98, 17.28, 0.92, 'white'], ['b', 159.52, 16.77, 1.2, 159.98, 17.28, 1.4, 'linen'],
      ['b', 159.52, 16.77, 1.6, 159.98, 17.28, 1.72, 'white'], ['b', 159.52, 16.07, 0.4, 159.98, 16.58, 0.56, 'linen'], ['b', 159.52, 16.07, 0.8, 159.98, 16.58, 0.92, 'white'], ['b', 159.52, 16.07, 1.2, 159.98, 16.58, 1.4, 'linen'],
      ['b', 159.52, 16.07, 1.6, 159.98, 16.58, 1.72, 'white'], ['b', 159.52, 15.37, 0.4, 159.98, 15.88, 0.56, 'linen'], ['b', 159.52, 15.37, 0.8, 159.98, 15.88, 0.92, 'white'], ['b', 159.52, 15.37, 1.2, 159.98, 15.88, 1.4, 'linen'],
      ['b', 159.52, 15.37, 1.6, 159.98, 15.88, 1.72, 'white'], ['b', 159.52, 14.67, 0.4, 159.98, 15.18, 0.56, 'linen'], ['b', 159.52, 14.67, 0.8, 159.98, 15.18, 0.92, 'white'], ['b', 159.52, 14.67, 1.2, 159.98, 15.18, 1.4, 'linen'],
      ['b', 159.52, 14.67, 1.6, 159.98, 15.18, 1.72, 'white'], ['b', 159.52, 13.97, 0.4, 159.98, 14.48, 0.56, 'linen'], ['b', 159.52, 13.97, 0.8, 159.98, 14.48, 0.92, 'white'], ['b', 159.52, 13.97, 1.2, 159.98, 14.48, 1.4, 'linen'],
      ['b', 159.52, 13.97, 1.6, 159.98, 14.48, 1.72, 'white'], ['b', 159.52, 13.27, 0.4, 159.98, 13.78, 0.56, 'linen'], ['b', 159.52, 13.27, 0.8, 159.98, 13.78, 0.92, 'white'], ['b', 159.52, 13.27, 1.2, 159.98, 13.78, 1.4, 'linen'],
      ['b', 159.52, 13.27, 1.6, 159.98, 13.78, 1.72, 'white'], ['b', 159.45, 11.75, 0, 160.02, 12.85, 0.85, 'stone'], ['b', 159.5, 11.9, 0.85, 160.02, 12.7, 0.9, 'white'], ['b', 159.94, 12.31, 0.9, 160.02, 12.35, 1.05, 'brass'],
      ['y', 155.65, 17.4, 0.17, 0, 0.35, 'wood'], ['y', 156.35, 17.3, 0.25, 0, 0.7, 'canvas'], ['b', 156.615, 10.75, 2.2, 156.655, 13.75, 2.23, 'pine'], ['b', 156.775, 10.75, 2.2, 156.815, 13.75, 2.23, 'pine'],
      ['b', 156.935, 10.75, 2.2, 156.975, 13.75, 2.23, 'pine'], ['b', 157.095, 10.75, 2.2, 157.135, 13.75, 2.23, 'pine'], ['b', 156.605, 13.63, 2.17, 157.145, 13.67, 2.25, 'iron'], ['y', 156.875, 13.65, 0.008, 2.25, 4.5, 'rope'],
      ['b', 156.605, 10.83, 2.17, 157.145, 10.87, 2.25, 'iron'], ['y', 156.875, 10.85, 0.008, 2.25, 4.5, 'rope'], ['b', 156.615, 13.05, 1.7, 156.625, 13.35, 2.2, 'linen'], ['b', 156.615, 12.35, 1.7, 156.625, 12.65, 2.2, 'white'],
      ['b', 156.615, 11.55, 1.7, 156.625, 11.85, 2.2, 'linen'], ['b', 153.73, 11.8, 0, 153.95, 12.7, 0.012, 'stone']] },
    /* 3-THINGS end elves-linen-room-3-east */
    /* 3-THINGS gryffindor-storeroom-3 */
    /* docs/interiors/upper-floors-gaps-1028.md (gryffindor-storeroom-3, g): scarlet banners hung folded on a rail along the back wall, a school trunk, squab cushions and a boarded chest on the side wall, a plank bench by the door; both doors' sweeps kept clear */
    'gryffindor-storeroom-3': { items: [
      ['b', 36.03, 12.1, 1.5, 36.11, 17.8, 1.56, 'oak'], ['b', 36.03, 12.3, 0.5, 36.1, 13.1, 1.5, 'scarlet'], ['b', 36.03, 12.3, 1.2, 36.105, 13.1, 1.26, 'gilt'], ['b', 36.03, 13.3, 0.5, 36.1, 14.1, 1.5, 'scarlet'],
      ['b', 36.03, 13.3, 1.2, 36.105, 14.1, 1.26, 'gilt'], ['b', 36.03, 14.3, 0.5, 36.1, 15.1, 1.5, 'scarlet'], ['b', 36.03, 14.3, 1.2, 36.105, 15.1, 1.26, 'gilt'], ['b', 36.03, 15.3, 0.5, 36.1, 16.1, 1.5, 'scarlet'],
      ['b', 36.03, 15.3, 1.2, 36.105, 16.1, 1.26, 'gilt'], ['b', 36.03, 16.3, 0.5, 36.1, 17.1, 1.5, 'scarlet'], ['b', 36.03, 16.3, 1.2, 36.105, 17.1, 1.26, 'gilt'], ['b', 40.05, 11.58, 0, 41.05, 12.15, 0.5, 'leather'],
      ['b', 40.05, 11.58, 0.5, 41.05, 12.17, 0.54, 'iron'], ['b', 38.65, 11.58, 0.0, 39.65, 12.2, 0.14, 'scarlet'], ['b', 38.69, 11.58, 0.14, 39.61, 12.2, 0.28, 'green'], ['b', 38.73, 11.58, 0.28, 39.57, 12.2, 0.42, 'blue'],
      ['b', 37.35, 11.58, 0, 38.25, 12.1, 0.45, 'oak'], ['b', 37.35, 11.58, 0.45, 38.25, 12.12, 0.49, 'iron'], ['t', 48.03, 12.0, 48.33, 13.35, 0.45, 'wood'], ['b', 48.15, 14.35, 0, 48.37, 15.25, 0.012, 'stone'],
      ['b', 41.75, 11.58, 0, 42.65, 11.8, 0.012, 'stone']] },
    /* 3-THINGS end gryffindor-storeroom-3 */
    /* 3-THINGS charms-classroom-3-west */
    /* docs/interiors/upper-floors-gaps-1028.md (charms-classroom-3-west, 25): double desks in two blocks of four either side of the aisle between the two doors, a chair at each seat, the master's table and chair by the south wall, squab cushions heaped in the corner; both doors' sweeps kept clear, nothing glows */
    'charms-classroom-3-west': { items: [
      ['b', 121.45, 61.85, 0.72, 122.65, 62.3, 0.76, 'oak'], ['b', 121.48, 61.88, 0, 121.51, 61.91, 0.72, 'oak'], ['b', 121.48, 62.24, 0, 121.51, 62.27, 0.72, 'oak'], ['b', 122.59, 61.88, 0, 122.62, 61.91, 0.72, 'oak'],
      ['b', 122.59, 62.24, 0, 122.62, 62.27, 0.72, 'oak'], ['t', 121.54, 61.24, 121.96, 61.66, 0.45, 'wood'], ['b', 121.54, 61.62, 0.45, 121.96, 61.66, 0.9, 'wood'], ['t', 122.14, 61.24, 122.56, 61.66, 0.45, 'wood'],
      ['b', 122.14, 61.62, 0.45, 122.56, 61.66, 0.9, 'wood'], ['b', 124.25, 61.85, 0.72, 125.45, 62.3, 0.76, 'oak'], ['b', 124.28, 61.88, 0, 124.31, 61.91, 0.72, 'oak'], ['b', 124.28, 62.24, 0, 124.31, 62.27, 0.72, 'oak'],
      ['b', 125.39, 61.88, 0, 125.42, 61.91, 0.72, 'oak'], ['b', 125.39, 62.24, 0, 125.42, 62.27, 0.72, 'oak'], ['t', 124.34, 61.24, 124.76, 61.66, 0.45, 'wood'], ['b', 124.34, 61.62, 0.45, 124.76, 61.66, 0.9, 'wood'],
      ['t', 124.94, 61.24, 125.36, 61.66, 0.45, 'wood'], ['b', 124.94, 61.62, 0.45, 125.36, 61.66, 0.9, 'wood'], ['b', 121.45, 64.25, 0.72, 122.65, 64.7, 0.76, 'oak'], ['b', 121.48, 64.28, 0, 121.51, 64.31, 0.72, 'oak'],
      ['b', 121.48, 64.64, 0, 121.51, 64.67, 0.72, 'oak'], ['b', 122.59, 64.28, 0, 122.62, 64.31, 0.72, 'oak'], ['b', 122.59, 64.64, 0, 122.62, 64.67, 0.72, 'oak'], ['t', 121.54, 63.64, 121.96, 64.06, 0.45, 'wood'],
      ['b', 121.54, 64.02, 0.45, 121.96, 64.06, 0.9, 'wood'], ['t', 122.14, 63.64, 122.56, 64.06, 0.45, 'wood'], ['b', 122.14, 64.02, 0.45, 122.56, 64.06, 0.9, 'wood'], ['b', 124.25, 64.25, 0.72, 125.45, 64.7, 0.76, 'oak'],
      ['b', 124.28, 64.28, 0, 124.31, 64.31, 0.72, 'oak'], ['b', 124.28, 64.64, 0, 124.31, 64.67, 0.72, 'oak'], ['b', 125.39, 64.28, 0, 125.42, 64.31, 0.72, 'oak'], ['b', 125.39, 64.64, 0, 125.42, 64.67, 0.72, 'oak'],
      ['t', 124.34, 63.64, 124.76, 64.06, 0.45, 'wood'], ['b', 124.34, 64.02, 0.45, 124.76, 64.06, 0.9, 'wood'], ['t', 124.94, 63.64, 125.36, 64.06, 0.45, 'wood'], ['b', 124.94, 64.02, 0.45, 125.36, 64.06, 0.9, 'wood'],
      ['b', 130.05, 61.85, 0.72, 131.25, 62.3, 0.76, 'oak'], ['b', 130.08, 61.88, 0, 130.11, 61.91, 0.72, 'oak'], ['b', 130.08, 62.24, 0, 130.11, 62.27, 0.72, 'oak'], ['b', 131.19, 61.88, 0, 131.22, 61.91, 0.72, 'oak'],
      ['b', 131.19, 62.24, 0, 131.22, 62.27, 0.72, 'oak'], ['t', 130.14, 61.24, 130.56, 61.66, 0.45, 'wood'], ['b', 130.14, 61.62, 0.45, 130.56, 61.66, 0.9, 'wood'], ['t', 130.74, 61.24, 131.16, 61.66, 0.45, 'wood'],
      ['b', 130.74, 61.62, 0.45, 131.16, 61.66, 0.9, 'wood'], ['b', 132.85, 61.85, 0.72, 134.05, 62.3, 0.76, 'oak'], ['b', 132.88, 61.88, 0, 132.91, 61.91, 0.72, 'oak'], ['b', 132.88, 62.24, 0, 132.91, 62.27, 0.72, 'oak'],
      ['b', 133.99, 61.88, 0, 134.02, 61.91, 0.72, 'oak'], ['b', 133.99, 62.24, 0, 134.02, 62.27, 0.72, 'oak'], ['t', 132.94, 61.24, 133.36, 61.66, 0.45, 'wood'], ['b', 132.94, 61.62, 0.45, 133.36, 61.66, 0.9, 'wood'],
      ['t', 133.54, 61.24, 133.96, 61.66, 0.45, 'wood'], ['b', 133.54, 61.62, 0.45, 133.96, 61.66, 0.9, 'wood'], ['b', 130.05, 64.25, 0.72, 131.25, 64.7, 0.76, 'oak'], ['b', 130.08, 64.28, 0, 130.11, 64.31, 0.72, 'oak'],
      ['b', 130.08, 64.64, 0, 130.11, 64.67, 0.72, 'oak'], ['b', 131.19, 64.28, 0, 131.22, 64.31, 0.72, 'oak'], ['b', 131.19, 64.64, 0, 131.22, 64.67, 0.72, 'oak'], ['t', 130.14, 63.64, 130.56, 64.06, 0.45, 'wood'],
      ['b', 130.14, 64.02, 0.45, 130.56, 64.06, 0.9, 'wood'], ['t', 130.74, 63.64, 131.16, 64.06, 0.45, 'wood'], ['b', 130.74, 64.02, 0.45, 131.16, 64.06, 0.9, 'wood'], ['b', 132.85, 64.25, 0.72, 134.05, 64.7, 0.76, 'oak'],
      ['b', 132.88, 64.28, 0, 132.91, 64.31, 0.72, 'oak'], ['b', 132.88, 64.64, 0, 132.91, 64.67, 0.72, 'oak'], ['b', 133.99, 64.28, 0, 134.02, 64.31, 0.72, 'oak'], ['b', 133.99, 64.64, 0, 134.02, 64.67, 0.72, 'oak'],
      ['t', 132.94, 63.64, 133.36, 64.06, 0.45, 'wood'], ['b', 132.94, 64.02, 0.45, 133.36, 64.06, 0.9, 'wood'], ['t', 133.54, 63.64, 133.96, 64.06, 0.45, 'wood'], ['b', 133.54, 64.02, 0.45, 133.96, 64.06, 0.9, 'wood'],
      ['t', 124.25, 68.25, 125.85, 69.05, 0.85, 'oak'], ['b', 124.45, 68.45, 0.85, 124.85, 68.75, 0.9, 'dark'], ['t', 124.84, 67.54, 125.26, 67.96, 0.45, 'dark'], ['b', 124.84, 67.92, 0.45, 125.26, 67.96, 0.9, 'dark'],
      ['b', 135.55, 68.85, 0.0, 136.55, 69.75, 0.12, 'scarlet'], ['b', 135.58, 68.87, 0.12, 136.53, 69.75, 0.24, 'blue'], ['b', 135.61, 68.89, 0.24, 136.51, 69.75, 0.36, 'green'], ['b', 128.0, 59.63, 0, 128.9, 59.85, 0.012, 'stone'],
      ['b', 128.05, 69.65, 0, 128.95, 69.87, 0.012, 'stone']] },
    /* 3-THINGS end charms-classroom-3-west */
    /* 3-THINGS room-beside-trophy-room-3 */
    /* docs/curator/trophy-next-room.md (TN1 to TN7; Interiors' schedule cites it): a long table down the room with dust sheets over older cups, tarnished cups and shields on shelves, honours boards stacked with one turned out, a retired case emptied, a one-armed statuette set aside, Filch's tins of plate powder and grey cloths; the Curator's own pieces (the case, cup and statuette) stand as plain forms */
    'room-beside-trophy-room-3': { items: [
      ['t', 16.9, 62.25, 18.1, 69.8, 0.8, 'oak'], ['b', 17.0, 62.85, 0.8, 18.0, 64.35, 1.05, 'linen'], ['b', 16.95, 62.83, 0.8, 17.0, 64.37, 0.9, 'stone'], ['b', 17.0, 65.25, 0.8, 18.0, 66.75, 1.05, 'linen'],
      ['b', 16.95, 65.23, 0.8, 17.0, 66.77, 0.9, 'stone'], ['b', 17.0, 67.65, 0.8, 18.0, 69.15, 1.05, 'linen'], ['b', 16.95, 67.63, 0.8, 17.0, 69.17, 0.9, 'stone'], ['y', 17.5, 69.5, 0.07, 0.8, 0.83, 'ebony'],
      ['y', 17.5, 69.5, 0.015, 0.83, 0.94, 'brass'], ['y', 17.5, 69.5, 0.07, 0.94, 1.07, 'gilt'], ['b', 17.44, 62.44, 0.8, 17.56, 62.56, 0.85, 'ebony'], ['y', 17.5, 62.5, 0.028, 0.85, 1.1, 'brass'],
      ['y', 17.5, 62.5, 0.04, 1.1, 1.14, 'brass'], ['s', 11.75, 71.6, 15.95, 72.02, [0.5, 0.95, 1.4, 1.85], 'oak'], ['y', 12.25, 71.825, 0.07, 0.5, 0.53, 'stone'], ['y', 12.25, 71.825, 0.015, 0.53, 0.64, 'stone'],
      ['y', 12.25, 71.825, 0.07, 0.64, 0.77, 'stone'], ['y', 12.25, 71.825, 0.07, 0.95, 0.98, 'stone'], ['y', 12.25, 71.825, 0.015, 0.98, 1.09, 'stone'], ['y', 12.25, 71.825, 0.07, 1.09, 1.22, 'stone'],
      ['b', 12.1, 71.785, 1.4, 12.4, 71.865, 1.68, 'stone'], ['b', 12.6, 71.785, 0.5, 12.9, 71.865, 0.78, 'stone'], ['b', 12.6, 71.785, 0.95, 12.9, 71.865, 1.23, 'stone'], ['y', 12.75, 71.825, 0.07, 1.4, 1.43, 'stone'],
      ['y', 12.75, 71.825, 0.015, 1.43, 1.54, 'stone'], ['y', 12.75, 71.825, 0.07, 1.54, 1.67, 'stone'], ['y', 13.25, 71.825, 0.07, 0.5, 0.53, 'stone'], ['y', 13.25, 71.825, 0.015, 0.53, 0.64, 'stone'],
      ['y', 13.25, 71.825, 0.07, 0.64, 0.77, 'stone'], ['y', 13.25, 71.825, 0.07, 0.95, 0.98, 'stone'], ['y', 13.25, 71.825, 0.015, 0.98, 1.09, 'stone'], ['y', 13.25, 71.825, 0.07, 1.09, 1.22, 'stone'],
      ['b', 13.1, 71.785, 1.4, 13.4, 71.865, 1.68, 'stone'], ['b', 13.6, 71.785, 0.5, 13.9, 71.865, 0.78, 'stone'], ['b', 13.6, 71.785, 0.95, 13.9, 71.865, 1.23, 'stone'], ['y', 13.75, 71.825, 0.07, 1.4, 1.43, 'stone'],
      ['y', 13.75, 71.825, 0.015, 1.43, 1.54, 'stone'], ['y', 13.75, 71.825, 0.07, 1.54, 1.67, 'stone'], ['y', 14.25, 71.825, 0.07, 0.5, 0.53, 'stone'], ['y', 14.25, 71.825, 0.015, 0.53, 0.64, 'stone'],
      ['y', 14.25, 71.825, 0.07, 0.64, 0.77, 'stone'], ['y', 14.25, 71.825, 0.07, 0.95, 0.98, 'stone'], ['y', 14.25, 71.825, 0.015, 0.98, 1.09, 'stone'], ['y', 14.25, 71.825, 0.07, 1.09, 1.22, 'stone'],
      ['b', 14.1, 71.785, 1.4, 14.4, 71.865, 1.68, 'stone'], ['b', 14.6, 71.785, 0.5, 14.9, 71.865, 0.78, 'stone'], ['b', 14.6, 71.785, 0.95, 14.9, 71.865, 1.23, 'stone'], ['y', 14.75, 71.825, 0.07, 1.4, 1.43, 'stone'],
      ['y', 14.75, 71.825, 0.015, 1.43, 1.54, 'stone'], ['y', 14.75, 71.825, 0.07, 1.54, 1.67, 'stone'], ['y', 15.25, 71.825, 0.07, 0.5, 0.53, 'stone'], ['y', 15.25, 71.825, 0.015, 0.53, 0.64, 'stone'],
      ['y', 15.25, 71.825, 0.07, 0.64, 0.77, 'stone'], ['y', 15.25, 71.825, 0.07, 0.95, 0.98, 'stone'], ['y', 15.25, 71.825, 0.015, 0.98, 1.09, 'stone'], ['y', 15.25, 71.825, 0.07, 1.09, 1.22, 'stone'],
      ['b', 15.1, 71.785, 1.4, 15.4, 71.865, 1.68, 'stone'], ['b', 23.71, 61.45, 0, 23.77, 62.55, 1.6, 'dark'], ['b', 23.67, 61.49, 0, 23.77, 62.59, 1.6, 'dark'], ['b', 23.63, 61.53, 0, 23.77, 62.63, 1.6, 'dark'],
      ['b', 23.59, 61.57, 0, 23.77, 62.67, 1.6, 'dark'], ['b', 23.71, 62.75, 0.0, 23.77, 63.85, 1.6, 'oak'], ['b', 23.7, 62.8, 0.3, 23.77, 63.8, 1.5, 'gilt'], ['b', 23.25, 64.65, 0, 23.77, 65.65, 1.9, 'dark'],
      ['b', 23.23, 64.7, 0.1, 23.77, 65.6, 1.85, 'glass'], ['b', 11.23, 61.55, 0, 11.65, 61.95, 0.5, 'dark'], ['y', 11.55, 61.75, 0.05, 0.5, 0.78, 'brass'], ['b', 11.23, 62.75, 0, 11.65, 63.35, 0.3, 'deal'],
      ['y', 11.45, 62.85, 0.04, 0.3, 0.36, 'tin'], ['y', 11.45, 62.97, 0.04, 0.3, 0.36, 'tin'], ['y', 11.45, 63.09, 0.04, 0.3, 0.36, 'tin'], ['y', 11.45, 63.21, 0.04, 0.3, 0.36, 'tin'],
      ['b', 11.3, 63.85, 0.0, 11.75, 64.35, 0.04, 'stone'], ['b', 11.3, 63.85, 0.04, 11.75, 64.35, 0.08, 'stone'], ['b', 11.3, 63.85, 0.08, 11.75, 64.35, 0.12, 'stone'], ['b', 17.05, 59.23, 0, 17.95, 59.45, 0.012, 'stone']] },
    /* 3-THINGS end room-beside-trophy-room-3 */
    /* 3-THINGS defence-practice-room-3 */
    /* docs/interiors/upper-floors-gaps-1028.md (defence-practice-room-3, z): bare boards, a plank bench on the side wall, a wall of padded practice arms on the back wall (none edged), nothing else on the floor; padded dummies are not drawn */
    'defence-practice-room-3': { items: [
      ['b', 28.8, 71.96, 0.9, 32.2, 72.02, 2.3, 'dark'], ['b', 28.985, 71.9, 1.17, 29.015, 72.02, 1.2, 'iron'], ['b', 29.985, 71.9, 1.17, 30.015, 72.02, 1.2, 'iron'], ['b', 28.9, 71.91, 1.2, 30.1, 71.98, 1.24, 'wood'],
      ['b', 29.85, 71.9, 1.195, 30.15, 71.98, 1.245, 'cloth'], ['b', 30.685, 71.9, 1.17, 30.715, 72.02, 1.2, 'iron'], ['b', 31.685, 71.9, 1.17, 31.715, 72.02, 1.2, 'iron'], ['b', 30.6, 71.91, 1.2, 31.8, 71.98, 1.24, 'wood'],
      ['b', 31.55, 71.9, 1.195, 31.85, 71.98, 1.245, 'cloth'], ['b', 28.985, 71.9, 1.57, 29.015, 72.02, 1.6, 'iron'], ['b', 29.985, 71.9, 1.57, 30.015, 72.02, 1.6, 'iron'], ['b', 28.9, 71.91, 1.6, 30.1, 71.98, 1.64, 'wood'],
      ['b', 29.85, 71.9, 1.595, 30.15, 71.98, 1.645, 'cloth'], ['b', 30.685, 71.9, 1.57, 30.715, 72.02, 1.6, 'iron'], ['b', 31.685, 71.9, 1.57, 31.715, 72.02, 1.6, 'iron'], ['b', 30.6, 71.91, 1.6, 31.8, 71.98, 1.64, 'wood'],
      ['b', 31.55, 71.9, 1.595, 31.85, 71.98, 1.645, 'cloth'], ['b', 28.985, 71.9, 1.97, 29.015, 72.02, 2.0, 'iron'], ['b', 29.985, 71.9, 1.97, 30.015, 72.02, 2.0, 'iron'], ['b', 28.9, 71.91, 2.0, 30.1, 71.98, 2.04, 'wood'],
      ['b', 29.85, 71.9, 1.995, 30.15, 71.98, 2.045, 'cloth'], ['b', 30.685, 71.9, 1.97, 30.715, 72.02, 2.0, 'iron'], ['b', 31.685, 71.9, 1.97, 31.715, 72.02, 2.0, 'iron'], ['b', 30.6, 71.91, 2.0, 31.8, 71.98, 2.04, 'wood'],
      ['b', 31.55, 71.9, 1.995, 31.85, 71.98, 2.045, 'cloth'], ['t', 24.27, 61.55, 24.57, 63.75, 0.45, 'wood'], ['b', 30.05, 59.23, 0, 30.95, 59.45, 0.012, 'stone']] },
    /* 3-THINGS end defence-practice-room-3 */
    /* 3-THINGS washrooms-3-trophy */
    /* docs/interiors/upper-floors-gaps-1028.md (washrooms-3-trophy, washrooms, the ground floor list scaled): 4 basins in a row on a slab with a looking glass, cubicles on the short walls, a mop and bucket by the door, towels on a rail; the leaf's sweep kept clear */
    'washrooms-3-trophy': { items: [
      ['b', 2.4, 12.23, 0.8, 6.2, 12.8, 0.85, 'stone'], ['b', 2.4, 12.23, 0, 6.2, 12.65, 0.8, 'white'], ['b', 2.4, 12.23, 0.85, 6.2, 12.29, 1.3, 'stone'], ['b', 5.48, 12.23, 0.85, 5.98, 12.71, 0.89, 'white'],
      ['b', 5.71, 12.23, 0.89, 5.75, 12.31, 1.0, 'brass'], ['b', 4.58, 12.23, 0.85, 5.08, 12.71, 0.89, 'white'], ['b', 4.81, 12.23, 0.89, 4.85, 12.31, 1.0, 'brass'], ['b', 3.68, 12.23, 0.85, 4.18, 12.71, 0.89, 'white'],
      ['b', 3.91, 12.23, 0.89, 3.95, 12.31, 1.0, 'brass'], ['b', 2.78, 12.23, 0.85, 3.28, 12.71, 0.89, 'white'], ['b', 3.01, 12.23, 0.89, 3.05, 12.31, 1.0, 'brass'], ['b', 2.5, 12.23, 1.5, 6.1, 12.28, 2.3, 'glass'],
      ['b', 6.2, 15.25, 0.1, 6.77, 16.1, 0.5, 'white'], ['b', 6.16, 15.25, 0.3, 6.22, 16.1, 1.9, 'pine'], ['b', 6.2, 14.25, 0.1, 6.77, 15.1, 0.5, 'white'], ['b', 6.16, 14.25, 0.3, 6.22, 15.1, 1.9, 'pine'],
      ['b', -0.02, 15.25, 0.1, 0.55, 16.1, 0.5, 'white'], ['b', 0.53, 15.25, 0.3, 0.59, 16.1, 1.9, 'pine'], ['b', -0.02, 14.25, 0.1, 0.55, 15.1, 0.5, 'white'], ['b', 0.53, 14.25, 0.3, 0.59, 15.1, 1.9, 'pine'],
      ['b', 2.295, 17.71, 0, 2.325, 17.77, 1.35, 'wood'], ['y', 1.925, 17.5, 0.16, 0, 0.32, 'tin'], ['b', 0.1, 17.69, 1.2, 1.0, 17.77, 1.24, 'oak'], ['b', 0.4, 17.7, 0.9, 0.8, 17.77, 1.2, 'linen'],
      ['b', 2.925, 17.55, 0, 3.825, 17.77, 0.012, 'stone'], ['b', 0.55, 12.23, 0, 1.45, 12.45, 0.012, 'stone']] },
    /* 3-THINGS end washrooms-3-trophy */
    /* 3-THINGS washrooms-3-middle */
    /* docs/interiors/upper-floors-gaps-1028.md (washrooms-3-middle, washrooms, the ground floor list scaled): 4 basins in a row on a slab with a looking glass, cubicles on the short walls, a mop and bucket by the door, towels on a rail; the leaf's sweep kept clear */
    'washrooms-3-middle': { items: [
      ['b', 97.95, 53.83, 0.8, 101.75, 54.4, 0.85, 'stone'], ['b', 97.95, 53.83, 0, 101.75, 54.25, 0.8, 'white'], ['b', 97.95, 53.83, 0.85, 101.75, 53.89, 1.3, 'stone'], ['b', 101.03, 53.83, 0.85, 101.53, 54.31, 0.89, 'white'],
      ['b', 101.26, 53.83, 0.89, 101.3, 53.91, 1.0, 'brass'], ['b', 100.13, 53.83, 0.85, 100.63, 54.31, 0.89, 'white'], ['b', 100.36, 53.83, 0.89, 100.4, 53.91, 1.0, 'brass'], ['b', 99.23, 53.83, 0.85, 99.73, 54.31, 0.89, 'white'],
      ['b', 99.46, 53.83, 0.89, 99.5, 53.91, 1.0, 'brass'], ['b', 98.33, 53.83, 0.85, 98.83, 54.31, 0.89, 'white'], ['b', 98.56, 53.83, 0.89, 98.6, 53.91, 1.0, 'brass'], ['b', 98.05, 53.83, 1.5, 101.65, 53.88, 2.3, 'glass'],
      ['b', 103.2, 55.25, 0.1, 103.77, 56.1, 0.5, 'white'], ['b', 103.16, 55.25, 0.3, 103.22, 56.1, 1.9, 'pine'], ['b', 96.23, 55.25, 0.1, 96.8, 56.1, 0.5, 'white'], ['b', 96.78, 55.25, 0.3, 96.84, 56.1, 1.9, 'pine'],
      ['b', 98.92, 57.71, 0, 98.95, 57.77, 1.35, 'wood'], ['y', 98.55, 57.5, 0.16, 0, 0.32, 'tin'], ['b', 96.35, 57.69, 1.2, 97.25, 57.77, 1.24, 'oak'], ['b', 96.65, 57.7, 0.9, 97.05, 57.77, 1.2, 'linen'],
      ['b', 99.55, 57.55, 0, 100.45, 57.77, 0.012, 'stone']] },
    /* 3-THINGS end washrooms-3-middle */
    /* 3-THINGS washrooms-3-east */
    /* docs/interiors/upper-floors-gaps-1028.md (washrooms-3-east, washrooms, the ground floor list scaled): 4 basins in a row on a slab with a looking glass, cubicles on the short walls, a mop and bucket by the door, towels on a rail; the leaf's sweep kept clear */
    'washrooms-3-east': { items: [
      ['b', 144.65, 57.3, 0.8, 148.45, 57.87, 0.85, 'stone'], ['b', 144.65, 57.45, 0, 148.45, 57.87, 0.8, 'white'], ['b', 144.65, 57.81, 0.85, 148.45, 57.87, 1.3, 'stone'], ['b', 144.87, 57.39, 0.85, 145.37, 57.87, 0.89, 'white'],
      ['b', 145.1, 57.79, 0.89, 145.14, 57.87, 1.0, 'brass'], ['b', 145.77, 57.39, 0.85, 146.27, 57.87, 0.89, 'white'], ['b', 146.0, 57.79, 0.89, 146.04, 57.87, 1.0, 'brass'], ['b', 146.67, 57.39, 0.85, 147.17, 57.87, 0.89, 'white'],
      ['b', 146.9, 57.79, 0.89, 146.94, 57.87, 1.0, 'brass'], ['b', 147.57, 57.39, 0.85, 148.07, 57.87, 0.89, 'white'], ['b', 147.8, 57.79, 0.89, 147.84, 57.87, 1.0, 'brass'], ['b', 144.75, 57.82, 1.5, 148.35, 57.87, 2.3, 'glass'],
      ['b', 144.23, 55.5, 0.1, 144.8, 56.35, 0.5, 'white'], ['b', 144.78, 55.5, 0.3, 144.84, 56.35, 1.9, 'pine'], ['b', 148.0, 55.5, 0.1, 148.57, 56.35, 0.5, 'white'], ['b', 147.96, 55.5, 0.3, 148.02, 56.35, 1.9, 'pine'],
      ['b', 147.55, 53.83, 0, 147.58, 53.89, 1.35, 'wood'], ['y', 147.95, 54.1, 0.16, 0, 0.32, 'tin'], ['b', 146.05, 53.83, 0, 146.95, 54.05, 0.012, 'stone']] },
    /* 3-THINGS end washrooms-3-east */
    /* 3-THINGS disused-classroom-3-lake */
    /* docs/interiors/upper-floors-gaps-1028.md (disused-classroom-3-lake, disused classrooms): double desks under dust sheets, one blackboard on the back wall still chalked; the way out is the door */
    'disused-classroom-3-lake': { items: [
      ['b', 130.91, 7.85, 0.72, 132.11, 8.3, 0.76, 'oak'], ['b', 130.94, 7.88, 0, 130.97, 7.91, 0.72, 'oak'], ['b', 130.94, 8.24, 0, 130.97, 8.27, 0.72, 'oak'], ['b', 132.05, 7.88, 0, 132.08, 7.91, 0.72, 'oak'],
      ['b', 132.05, 8.24, 0, 132.08, 8.27, 0.72, 'oak'], ['b', 130.88, 7.82, 0.55, 132.14, 8.33, 0.82, 'cloth'], ['b', 133.91, 7.85, 0.72, 135.11, 8.3, 0.76, 'oak'], ['b', 133.94, 7.88, 0, 133.97, 7.91, 0.72, 'oak'],
      ['b', 133.94, 8.24, 0, 133.97, 8.27, 0.72, 'oak'], ['b', 135.05, 7.88, 0, 135.08, 7.91, 0.72, 'oak'], ['b', 135.05, 8.24, 0, 135.08, 8.27, 0.72, 'oak'], ['b', 133.88, 7.82, 0.55, 135.14, 8.33, 0.82, 'cloth'],
      ['b', 136.91, 7.85, 0.72, 138.11, 8.3, 0.76, 'oak'], ['b', 136.94, 7.88, 0, 136.97, 7.91, 0.72, 'oak'], ['b', 136.94, 8.24, 0, 136.97, 8.27, 0.72, 'oak'], ['b', 138.05, 7.88, 0, 138.08, 7.91, 0.72, 'oak'],
      ['b', 138.05, 8.24, 0, 138.08, 8.27, 0.72, 'oak'], ['b', 136.88, 7.82, 0.55, 138.14, 8.33, 0.82, 'cloth'], ['b', 130.91, 10.45, 0.72, 132.11, 10.9, 0.76, 'oak'], ['b', 130.94, 10.48, 0, 130.97, 10.51, 0.72, 'oak'],
      ['b', 130.94, 10.84, 0, 130.97, 10.87, 0.72, 'oak'], ['b', 132.05, 10.48, 0, 132.08, 10.51, 0.72, 'oak'], ['b', 132.05, 10.84, 0, 132.08, 10.87, 0.72, 'oak'], ['b', 130.88, 10.42, 0.55, 132.14, 10.93, 0.82, 'cloth'],
      ['b', 133.91, 10.45, 0.72, 135.11, 10.9, 0.76, 'oak'], ['b', 133.94, 10.48, 0, 133.97, 10.51, 0.72, 'oak'], ['b', 133.94, 10.84, 0, 133.97, 10.87, 0.72, 'oak'], ['b', 135.05, 10.48, 0, 135.08, 10.51, 0.72, 'oak'],
      ['b', 135.05, 10.84, 0, 135.08, 10.87, 0.72, 'oak'], ['b', 133.88, 10.42, 0.55, 135.14, 10.93, 0.82, 'cloth'], ['b', 136.91, 10.45, 0.72, 138.11, 10.9, 0.76, 'oak'], ['b', 136.94, 10.48, 0, 136.97, 10.51, 0.72, 'oak'],
      ['b', 136.94, 10.84, 0, 136.97, 10.87, 0.72, 'oak'], ['b', 138.05, 10.48, 0, 138.08, 10.51, 0.72, 'oak'], ['b', 138.05, 10.84, 0, 138.08, 10.87, 0.72, 'oak'], ['b', 136.88, 10.42, 0.55, 138.14, 10.93, 0.82, 'cloth'],
      ['b', 130.91, 13.05, 0.72, 132.11, 13.5, 0.76, 'oak'], ['b', 130.94, 13.08, 0, 130.97, 13.11, 0.72, 'oak'], ['b', 130.94, 13.44, 0, 130.97, 13.47, 0.72, 'oak'], ['b', 132.05, 13.08, 0, 132.08, 13.11, 0.72, 'oak'],
      ['b', 132.05, 13.44, 0, 132.08, 13.47, 0.72, 'oak'], ['b', 130.88, 13.02, 0.55, 132.14, 13.53, 0.82, 'cloth'], ['b', 133.91, 13.05, 0.72, 135.11, 13.5, 0.76, 'oak'], ['b', 133.94, 13.08, 0, 133.97, 13.11, 0.72, 'oak'],
      ['b', 133.94, 13.44, 0, 133.97, 13.47, 0.72, 'oak'], ['b', 135.05, 13.08, 0, 135.08, 13.11, 0.72, 'oak'], ['b', 135.05, 13.44, 0, 135.08, 13.47, 0.72, 'oak'], ['b', 133.88, 13.02, 0.55, 135.14, 13.53, 0.82, 'cloth'],
      ['b', 136.91, 13.05, 0.72, 138.11, 13.5, 0.76, 'oak'], ['b', 136.94, 13.08, 0, 136.97, 13.11, 0.72, 'oak'], ['b', 136.94, 13.44, 0, 136.97, 13.47, 0.72, 'oak'], ['b', 138.05, 13.08, 0, 138.08, 13.11, 0.72, 'oak'],
      ['b', 138.05, 13.44, 0, 138.08, 13.47, 0.72, 'oak'], ['b', 136.88, 13.02, 0.55, 138.14, 13.53, 0.82, 'cloth'], ['b', 133.82, 17.96, 1.0, 136.82, 18.02, 2.2, 'black'], ['b', 133.82, 17.92, 0.95, 136.82, 18.02, 1.0, 'oak'],
      ['b', 134.32, 17.945, 1.5, 135.12, 18.02, 1.52, 'white'], ['b', 134.87, 3.83, 0, 135.77, 4.05, 0.012, 'stone']] },
    /* 3-THINGS end disused-classroom-3-lake */
    /* 3-THINGS study-room-3-lake */
    /* docs/interiors/upper-floors-gaps-1028.md (study-room-3-lake, study rooms): a joined table with joint stools either side, papers and inkwells, a bookcase on the back wall, satchels on a hook board; the leaf's sweep kept clear */
    'study-room-3-lake': { items: [
      ['t', 122.65, 8.925, 123.75, 12.925, 0.76, 'oak'], ['b', 122.2, 9.275, 0.41, 122.5, 9.575, 0.45, 'wood'], ['b', 122.22, 9.295, 0, 122.25, 9.325, 0.41, 'wood'], ['b', 122.22, 9.525, 0, 122.25, 9.555, 0.41, 'wood'],
      ['b', 122.45, 9.295, 0, 122.48, 9.325, 0.41, 'wood'], ['b', 122.45, 9.525, 0, 122.48, 9.555, 0.41, 'wood'], ['b', 123.9, 9.275, 0.41, 124.2, 9.575, 0.45, 'wood'], ['b', 123.92, 9.295, 0, 123.95, 9.325, 0.41, 'wood'],
      ['b', 123.92, 9.525, 0, 123.95, 9.555, 0.41, 'wood'], ['b', 124.15, 9.295, 0, 124.18, 9.325, 0.41, 'wood'], ['b', 124.15, 9.525, 0, 124.18, 9.555, 0.41, 'wood'], ['b', 122.75, 9.275, 0.76, 123.05, 9.575, 0.78, 'paper'],
      ['b', 122.2, 10.275, 0.41, 122.5, 10.575, 0.45, 'wood'], ['b', 122.22, 10.295, 0, 122.25, 10.325, 0.41, 'wood'], ['b', 122.22, 10.525, 0, 122.25, 10.555, 0.41, 'wood'], ['b', 122.45, 10.295, 0, 122.48, 10.325, 0.41, 'wood'],
      ['b', 122.45, 10.525, 0, 122.48, 10.555, 0.41, 'wood'], ['b', 123.9, 10.275, 0.41, 124.2, 10.575, 0.45, 'wood'], ['b', 123.92, 10.295, 0, 123.95, 10.325, 0.41, 'wood'], ['b', 123.92, 10.525, 0, 123.95, 10.555, 0.41, 'wood'],
      ['b', 124.15, 10.295, 0, 124.18, 10.325, 0.41, 'wood'], ['b', 124.15, 10.525, 0, 124.18, 10.555, 0.41, 'wood'], ['b', 123.05, 10.275, 0.76, 123.35, 10.575, 0.78, 'paper'], ['b', 122.2, 11.275, 0.41, 122.5, 11.575, 0.45, 'wood'],
      ['b', 122.22, 11.295, 0, 122.25, 11.325, 0.41, 'wood'], ['b', 122.22, 11.525, 0, 122.25, 11.555, 0.41, 'wood'], ['b', 122.45, 11.295, 0, 122.48, 11.325, 0.41, 'wood'], ['b', 122.45, 11.525, 0, 122.48, 11.555, 0.41, 'wood'],
      ['b', 123.9, 11.275, 0.41, 124.2, 11.575, 0.45, 'wood'], ['b', 123.92, 11.295, 0, 123.95, 11.325, 0.41, 'wood'], ['b', 123.92, 11.525, 0, 123.95, 11.555, 0.41, 'wood'], ['b', 124.15, 11.295, 0, 124.18, 11.325, 0.41, 'wood'],
      ['b', 124.15, 11.525, 0, 124.18, 11.555, 0.41, 'wood'], ['b', 122.75, 11.275, 0.76, 123.05, 11.575, 0.78, 'paper'], ['b', 122.2, 12.275, 0.41, 122.5, 12.575, 0.45, 'wood'], ['b', 122.22, 12.295, 0, 122.25, 12.325, 0.41, 'wood'],
      ['b', 122.22, 12.525, 0, 122.25, 12.555, 0.41, 'wood'], ['b', 122.45, 12.295, 0, 122.48, 12.325, 0.41, 'wood'], ['b', 122.45, 12.525, 0, 122.48, 12.555, 0.41, 'wood'], ['b', 123.9, 12.275, 0.41, 124.2, 12.575, 0.45, 'wood'],
      ['b', 123.92, 12.295, 0, 123.95, 12.325, 0.41, 'wood'], ['b', 123.92, 12.525, 0, 123.95, 12.555, 0.41, 'wood'], ['b', 124.15, 12.295, 0, 124.18, 12.325, 0.41, 'wood'], ['b', 124.15, 12.525, 0, 124.18, 12.555, 0.41, 'wood'],
      ['b', 123.05, 12.275, 0.76, 123.35, 12.575, 0.78, 'paper'], ['y', 123.15, 9.525, 0.03, 0.76, 0.84, 'dark'], ['y', 123.15, 10.625, 0.03, 0.76, 0.84, 'dark'], ['s', 117.89, 17.65, 121.39, 18.02, [0.1, 0.5, 0.9, 1.3000000000000003, 1.7000000000000002, 2.1], 'oak'],
      ['b', 117.95, 17.69, 0.11, 118.15, 17.94, 0.41, 'leather'], ['b', 118.17, 17.69, 0.11, 118.4, 17.94, 0.43, 'dark'], ['b', 118.42, 17.69, 0.11, 118.68, 17.94, 0.45, 'scarlet'], ['b', 118.7, 17.69, 0.11, 118.9, 17.94, 0.47, 'blue'],
      ['b', 118.92, 17.69, 0.11, 119.15, 17.94, 0.41, 'green'], ['b', 119.17, 17.69, 0.11, 119.43, 17.94, 0.43, 'leather'], ['b', 119.45, 17.69, 0.11, 119.65, 17.94, 0.45, 'dark'], ['b', 119.67, 17.69, 0.11, 119.9, 17.94, 0.47, 'scarlet'],
      ['b', 119.92, 17.69, 0.11, 120.18, 17.94, 0.41, 'blue'], ['b', 120.2, 17.69, 0.11, 120.4, 17.94, 0.43, 'green'], ['b', 120.42, 17.69, 0.11, 120.65, 17.94, 0.45, 'leather'], ['b', 120.67, 17.69, 0.11, 120.93, 17.94, 0.47, 'dark'],
      ['b', 120.95, 17.69, 0.11, 121.15, 17.94, 0.41, 'scarlet'], ['b', 121.17, 17.69, 0.11, 121.4, 17.94, 0.43, 'blue'], ['b', 117.95, 17.69, 0.51, 118.18, 17.94, 0.87, 'dark'], ['b', 118.2, 17.69, 0.51, 118.46, 17.94, 0.81, 'scarlet'],
      ['b', 118.48, 17.69, 0.51, 118.68, 17.94, 0.83, 'blue'], ['b', 118.7, 17.69, 0.51, 118.93, 17.94, 0.85, 'green'], ['b', 118.95, 17.69, 0.51, 119.21, 17.94, 0.87, 'leather'], ['b', 119.23, 17.69, 0.51, 119.43, 17.94, 0.81, 'dark'],
      ['b', 119.45, 17.69, 0.51, 119.68, 17.94, 0.83, 'scarlet'], ['b', 119.7, 17.69, 0.51, 119.96, 17.94, 0.85, 'blue'], ['b', 119.98, 17.69, 0.51, 120.18, 17.94, 0.87, 'green'], ['b', 120.2, 17.69, 0.51, 120.43, 17.94, 0.81, 'leather'],
      ['b', 120.45, 17.69, 0.51, 120.71, 17.94, 0.83, 'dark'], ['b', 120.73, 17.69, 0.51, 120.93, 17.94, 0.85, 'scarlet'], ['b', 120.95, 17.69, 0.51, 121.18, 17.94, 0.87, 'blue'], ['b', 121.2, 17.69, 0.51, 121.46, 17.94, 0.81, 'green'],
      ['b', 117.95, 17.69, 0.91, 118.21, 17.94, 1.25, 'scarlet'], ['b', 118.23, 17.69, 0.91, 118.43, 17.94, 1.27, 'blue'], ['b', 118.45, 17.69, 0.91, 118.68, 17.94, 1.21, 'green'], ['b', 118.7, 17.69, 0.91, 118.96, 17.94, 1.23, 'leather'],
      ['b', 118.98, 17.69, 0.91, 119.18, 17.94, 1.25, 'dark'], ['b', 119.2, 17.69, 0.91, 119.43, 17.94, 1.27, 'scarlet'], ['b', 119.45, 17.69, 0.91, 119.71, 17.94, 1.21, 'blue'], ['b', 119.73, 17.69, 0.91, 119.93, 17.94, 1.23, 'green'],
      ['b', 119.95, 17.69, 0.91, 120.18, 17.94, 1.25, 'leather'], ['b', 120.2, 17.69, 0.91, 120.46, 17.94, 1.27, 'dark'], ['b', 120.48, 17.69, 0.91, 120.68, 17.94, 1.21, 'scarlet'], ['b', 120.7, 17.69, 0.91, 120.93, 17.94, 1.23, 'blue'],
      ['b', 120.95, 17.69, 0.91, 121.21, 17.94, 1.25, 'green'], ['b', 117.95, 17.69, 1.31, 118.15, 17.94, 1.63, 'blue'], ['b', 118.17, 17.69, 1.31, 118.4, 17.94, 1.65, 'green'], ['b', 118.42, 17.69, 1.31, 118.68, 17.94, 1.67, 'leather'],
      ['b', 118.7, 17.69, 1.31, 118.9, 17.94, 1.61, 'dark'], ['b', 118.92, 17.69, 1.31, 119.15, 17.94, 1.63, 'scarlet'], ['b', 119.17, 17.69, 1.31, 119.43, 17.94, 1.65, 'blue'], ['b', 119.45, 17.69, 1.31, 119.65, 17.94, 1.67, 'green'],
      ['b', 119.67, 17.69, 1.31, 119.9, 17.94, 1.61, 'leather'], ['b', 119.92, 17.69, 1.31, 120.18, 17.94, 1.63, 'dark'], ['b', 120.2, 17.69, 1.31, 120.4, 17.94, 1.65, 'scarlet'], ['b', 120.42, 17.69, 1.31, 120.65, 17.94, 1.67, 'blue'],
      ['b', 120.67, 17.69, 1.31, 120.93, 17.94, 1.61, 'green'], ['b', 120.95, 17.69, 1.31, 121.15, 17.94, 1.63, 'leather'], ['b', 121.17, 17.69, 1.31, 121.4, 17.94, 1.65, 'dark'], ['b', 117.95, 17.69, 1.71, 118.18, 17.94, 2.01, 'green'],
      ['b', 118.2, 17.69, 1.71, 118.46, 17.94, 2.03, 'leather'], ['b', 118.48, 17.69, 1.71, 118.68, 17.94, 2.05, 'dark'], ['b', 118.7, 17.69, 1.71, 118.93, 17.94, 2.07, 'scarlet'], ['b', 118.95, 17.69, 1.71, 119.21, 17.94, 2.01, 'blue'],
      ['b', 119.23, 17.69, 1.71, 119.43, 17.94, 2.03, 'green'], ['b', 119.45, 17.69, 1.71, 119.68, 17.94, 2.05, 'leather'], ['b', 119.7, 17.69, 1.71, 119.96, 17.94, 2.07, 'dark'], ['b', 119.98, 17.69, 1.71, 120.18, 17.94, 2.01, 'scarlet'],
      ['b', 120.2, 17.69, 1.71, 120.43, 17.94, 2.03, 'blue'], ['b', 120.45, 17.69, 1.71, 120.71, 17.94, 2.05, 'green'], ['b', 120.73, 17.69, 1.71, 120.93, 17.94, 2.07, 'leather'], ['b', 120.95, 17.69, 1.71, 121.18, 17.94, 2.01, 'dark'],
      ['b', 121.2, 17.69, 1.71, 121.46, 17.94, 2.03, 'scarlet'], ['b', 128.95, 5.55, 1.45, 129.03, 8.35, 1.52, 'oak'], ['b', 128.89, 5.85, 1.0, 129.03, 6.25, 1.5, 'leather'], ['b', 128.89, 6.55, 1.0, 129.03, 6.95, 1.5, 'leather'],
      ['b', 128.89, 7.25, 1.0, 129.03, 7.65, 1.5, 'leather'], ['b', 128.89, 7.95, 1.0, 129.03, 8.35, 1.5, 'leather'], ['b', 122.75, 3.83, 0, 123.65, 4.05, 0.012, 'stone']] },
    /* 3-THINGS end study-room-3-lake */
    /* 3-THINGS third-years-study-room-3 */
    /* docs/interiors/upper-floors-gaps-1028.md (third-years-study-room-3, study rooms): a joined table with joint stools either side, papers and inkwells, a bookcase on the back wall, satchels on a hook board; the leaf's sweep kept clear */
    'third-years-study-room-3': { items: [
      ['t', 98.41, 8.925, 99.51, 12.925, 0.76, 'oak'], ['b', 97.96, 9.275, 0.41, 98.26, 9.575, 0.45, 'wood'], ['b', 97.98, 9.295, 0, 98.01, 9.325, 0.41, 'wood'], ['b', 97.98, 9.525, 0, 98.01, 9.555, 0.41, 'wood'],
      ['b', 98.21, 9.295, 0, 98.24, 9.325, 0.41, 'wood'], ['b', 98.21, 9.525, 0, 98.24, 9.555, 0.41, 'wood'], ['b', 99.66, 9.275, 0.41, 99.96, 9.575, 0.45, 'wood'], ['b', 99.68, 9.295, 0, 99.71, 9.325, 0.41, 'wood'],
      ['b', 99.68, 9.525, 0, 99.71, 9.555, 0.41, 'wood'], ['b', 99.91, 9.295, 0, 99.94, 9.325, 0.41, 'wood'], ['b', 99.91, 9.525, 0, 99.94, 9.555, 0.41, 'wood'], ['b', 98.51, 9.275, 0.76, 98.81, 9.575, 0.78, 'paper'],
      ['b', 97.96, 10.275, 0.41, 98.26, 10.575, 0.45, 'wood'], ['b', 97.98, 10.295, 0, 98.01, 10.325, 0.41, 'wood'], ['b', 97.98, 10.525, 0, 98.01, 10.555, 0.41, 'wood'], ['b', 98.21, 10.295, 0, 98.24, 10.325, 0.41, 'wood'],
      ['b', 98.21, 10.525, 0, 98.24, 10.555, 0.41, 'wood'], ['b', 99.66, 10.275, 0.41, 99.96, 10.575, 0.45, 'wood'], ['b', 99.68, 10.295, 0, 99.71, 10.325, 0.41, 'wood'], ['b', 99.68, 10.525, 0, 99.71, 10.555, 0.41, 'wood'],
      ['b', 99.91, 10.295, 0, 99.94, 10.325, 0.41, 'wood'], ['b', 99.91, 10.525, 0, 99.94, 10.555, 0.41, 'wood'], ['b', 98.81, 10.275, 0.76, 99.11, 10.575, 0.78, 'paper'], ['b', 97.96, 11.275, 0.41, 98.26, 11.575, 0.45, 'wood'],
      ['b', 97.98, 11.295, 0, 98.01, 11.325, 0.41, 'wood'], ['b', 97.98, 11.525, 0, 98.01, 11.555, 0.41, 'wood'], ['b', 98.21, 11.295, 0, 98.24, 11.325, 0.41, 'wood'], ['b', 98.21, 11.525, 0, 98.24, 11.555, 0.41, 'wood'],
      ['b', 99.66, 11.275, 0.41, 99.96, 11.575, 0.45, 'wood'], ['b', 99.68, 11.295, 0, 99.71, 11.325, 0.41, 'wood'], ['b', 99.68, 11.525, 0, 99.71, 11.555, 0.41, 'wood'], ['b', 99.91, 11.295, 0, 99.94, 11.325, 0.41, 'wood'],
      ['b', 99.91, 11.525, 0, 99.94, 11.555, 0.41, 'wood'], ['b', 98.51, 11.275, 0.76, 98.81, 11.575, 0.78, 'paper'], ['b', 97.96, 12.275, 0.41, 98.26, 12.575, 0.45, 'wood'], ['b', 97.98, 12.295, 0, 98.01, 12.325, 0.41, 'wood'],
      ['b', 97.98, 12.525, 0, 98.01, 12.555, 0.41, 'wood'], ['b', 98.21, 12.295, 0, 98.24, 12.325, 0.41, 'wood'], ['b', 98.21, 12.525, 0, 98.24, 12.555, 0.41, 'wood'], ['b', 99.66, 12.275, 0.41, 99.96, 12.575, 0.45, 'wood'],
      ['b', 99.68, 12.295, 0, 99.71, 12.325, 0.41, 'wood'], ['b', 99.68, 12.525, 0, 99.71, 12.555, 0.41, 'wood'], ['b', 99.91, 12.295, 0, 99.94, 12.325, 0.41, 'wood'], ['b', 99.91, 12.525, 0, 99.94, 12.555, 0.41, 'wood'],
      ['b', 98.81, 12.275, 0.76, 99.11, 12.575, 0.78, 'paper'], ['y', 98.91, 9.525, 0.03, 0.76, 0.84, 'dark'], ['y', 98.91, 10.625, 0.03, 0.76, 0.84, 'dark'], ['y', 98.91, 11.725, 0.03, 0.76, 0.84, 'dark'],
      ['s', 93.65, 17.65, 97.15, 18.02, [0.1, 0.5, 0.9, 1.3000000000000003, 1.7000000000000002, 2.1], 'oak'], ['b', 93.71, 17.69, 0.11, 93.91, 17.94, 0.41, 'leather'], ['b', 93.93, 17.69, 0.11, 94.16, 17.94, 0.43, 'dark'], ['b', 94.18, 17.69, 0.11, 94.44, 17.94, 0.45, 'scarlet'],
      ['b', 94.46, 17.69, 0.11, 94.66, 17.94, 0.47, 'blue'], ['b', 94.68, 17.69, 0.11, 94.91, 17.94, 0.41, 'green'], ['b', 94.93, 17.69, 0.11, 95.19, 17.94, 0.43, 'leather'], ['b', 95.21, 17.69, 0.11, 95.41, 17.94, 0.45, 'dark'],
      ['b', 95.43, 17.69, 0.11, 95.66, 17.94, 0.47, 'scarlet'], ['b', 95.68, 17.69, 0.11, 95.94, 17.94, 0.41, 'blue'], ['b', 95.96, 17.69, 0.11, 96.16, 17.94, 0.43, 'green'], ['b', 96.18, 17.69, 0.11, 96.41, 17.94, 0.45, 'leather'],
      ['b', 96.43, 17.69, 0.11, 96.69, 17.94, 0.47, 'dark'], ['b', 96.71, 17.69, 0.11, 96.91, 17.94, 0.41, 'scarlet'], ['b', 96.93, 17.69, 0.11, 97.16, 17.94, 0.43, 'blue'], ['b', 93.71, 17.69, 0.51, 93.94, 17.94, 0.87, 'dark'],
      ['b', 93.96, 17.69, 0.51, 94.22, 17.94, 0.81, 'scarlet'], ['b', 94.24, 17.69, 0.51, 94.44, 17.94, 0.83, 'blue'], ['b', 94.46, 17.69, 0.51, 94.69, 17.94, 0.85, 'green'], ['b', 94.71, 17.69, 0.51, 94.97, 17.94, 0.87, 'leather'],
      ['b', 94.99, 17.69, 0.51, 95.19, 17.94, 0.81, 'dark'], ['b', 95.21, 17.69, 0.51, 95.44, 17.94, 0.83, 'scarlet'], ['b', 95.46, 17.69, 0.51, 95.72, 17.94, 0.85, 'blue'], ['b', 95.74, 17.69, 0.51, 95.94, 17.94, 0.87, 'green'],
      ['b', 95.96, 17.69, 0.51, 96.19, 17.94, 0.81, 'leather'], ['b', 96.21, 17.69, 0.51, 96.47, 17.94, 0.83, 'dark'], ['b', 96.49, 17.69, 0.51, 96.69, 17.94, 0.85, 'scarlet'], ['b', 96.71, 17.69, 0.51, 96.94, 17.94, 0.87, 'blue'],
      ['b', 96.96, 17.69, 0.51, 97.22, 17.94, 0.81, 'green'], ['b', 93.71, 17.69, 0.91, 93.97, 17.94, 1.25, 'scarlet'], ['b', 93.99, 17.69, 0.91, 94.19, 17.94, 1.27, 'blue'], ['b', 94.21, 17.69, 0.91, 94.44, 17.94, 1.21, 'green'],
      ['b', 94.46, 17.69, 0.91, 94.72, 17.94, 1.23, 'leather'], ['b', 94.74, 17.69, 0.91, 94.94, 17.94, 1.25, 'dark'], ['b', 94.96, 17.69, 0.91, 95.19, 17.94, 1.27, 'scarlet'], ['b', 95.21, 17.69, 0.91, 95.47, 17.94, 1.21, 'blue'],
      ['b', 95.49, 17.69, 0.91, 95.69, 17.94, 1.23, 'green'], ['b', 95.71, 17.69, 0.91, 95.94, 17.94, 1.25, 'leather'], ['b', 95.96, 17.69, 0.91, 96.22, 17.94, 1.27, 'dark'], ['b', 96.24, 17.69, 0.91, 96.44, 17.94, 1.21, 'scarlet'],
      ['b', 96.46, 17.69, 0.91, 96.69, 17.94, 1.23, 'blue'], ['b', 96.71, 17.69, 0.91, 96.97, 17.94, 1.25, 'green'], ['b', 93.71, 17.69, 1.31, 93.91, 17.94, 1.63, 'blue'], ['b', 93.93, 17.69, 1.31, 94.16, 17.94, 1.65, 'green'],
      ['b', 94.18, 17.69, 1.31, 94.44, 17.94, 1.67, 'leather'], ['b', 94.46, 17.69, 1.31, 94.66, 17.94, 1.61, 'dark'], ['b', 94.68, 17.69, 1.31, 94.91, 17.94, 1.63, 'scarlet'], ['b', 94.93, 17.69, 1.31, 95.19, 17.94, 1.65, 'blue'],
      ['b', 95.21, 17.69, 1.31, 95.41, 17.94, 1.67, 'green'], ['b', 95.43, 17.69, 1.31, 95.66, 17.94, 1.61, 'leather'], ['b', 95.68, 17.69, 1.31, 95.94, 17.94, 1.63, 'dark'], ['b', 95.96, 17.69, 1.31, 96.16, 17.94, 1.65, 'scarlet'],
      ['b', 96.18, 17.69, 1.31, 96.41, 17.94, 1.67, 'blue'], ['b', 96.43, 17.69, 1.31, 96.69, 17.94, 1.61, 'green'], ['b', 96.71, 17.69, 1.31, 96.91, 17.94, 1.63, 'leather'], ['b', 96.93, 17.69, 1.31, 97.16, 17.94, 1.65, 'dark'],
      ['b', 93.71, 17.69, 1.71, 93.94, 17.94, 2.01, 'green'], ['b', 93.96, 17.69, 1.71, 94.22, 17.94, 2.03, 'leather'], ['b', 94.24, 17.69, 1.71, 94.44, 17.94, 2.05, 'dark'], ['b', 94.46, 17.69, 1.71, 94.69, 17.94, 2.07, 'scarlet'],
      ['b', 94.71, 17.69, 1.71, 94.97, 17.94, 2.01, 'blue'], ['b', 94.99, 17.69, 1.71, 95.19, 17.94, 2.03, 'green'], ['b', 95.21, 17.69, 1.71, 95.44, 17.94, 2.05, 'leather'], ['b', 95.46, 17.69, 1.71, 95.72, 17.94, 2.07, 'dark'],
      ['b', 95.74, 17.69, 1.71, 95.94, 17.94, 2.01, 'scarlet'], ['b', 95.96, 17.69, 1.71, 96.19, 17.94, 2.03, 'blue'], ['b', 96.21, 17.69, 1.71, 96.47, 17.94, 2.05, 'green'], ['b', 96.49, 17.69, 1.71, 96.69, 17.94, 2.07, 'leather'],
      ['b', 96.71, 17.69, 1.71, 96.94, 17.94, 2.01, 'dark'], ['b', 96.96, 17.69, 1.71, 97.22, 17.94, 2.03, 'scarlet'], ['b', 104.71, 5.55, 1.45, 104.79, 8.35, 1.52, 'oak'], ['b', 104.65, 5.85, 1.0, 104.79, 6.25, 1.5, 'leather'],
      ['b', 104.65, 6.55, 1.0, 104.79, 6.95, 1.5, 'leather'], ['b', 104.65, 7.25, 1.0, 104.79, 7.65, 1.5, 'leather'], ['b', 104.65, 7.95, 1.0, 104.79, 8.35, 1.5, 'leather'], ['b', 98.51, 3.83, 0, 99.41, 4.05, 0.012, 'stone']] },
    /* 3-THINGS end third-years-study-room-3 */
    /* 3-THINGS teachers-study-3-east */
    /* docs/interiors/upper-floors-gaps-1028.md (teachers-study-3-east, teachers' studies): a writing desk with a windsor chair on a hearth rug, a bookcase and no clock and one portrait, an oil lamp; the leaf's sweep kept clear */
    'teachers-study-3-east': { items: [
      ['t', 157.45, 19.55, 158.15, 20.95, 0.76, 'oak'], ['b', 157.5, 20.5, 0.45, 158.1, 20.9, 0.72, 'dark'], ['b', 157.55, 20.45, 0.76, 157.9, 20.85, 0.78, 'paper'], ['y', 157.8, 19.8, 0.06, 0.76, 0.79, 'brass'],
      ['y', 157.8, 19.8, 0.04, 0.79, 0.88, 'glass'], ['y', 157.8, 19.8, 0.025, 0.88, 1.06, 'glass'], ['t', 156.79, 20.04, 157.21, 20.46, 0.45, 'wood'], ['b', 156.79, 20.04, 0.45, 156.83, 20.46, 0.9, 'wood'],
      ['b', 156.25, 19.15, 0, 158.45, 21.35, 0.012, 'scarlet'], ['s', 159.7, 18.85, 160.07, 21.85, [0.1, 0.5, 0.9, 1.3000000000000003, 1.7000000000000002, 2.1], 'oak'], ['b', 159.74, 18.91, 0.11, 159.99, 19.11, 0.41, 'leather'], ['b', 159.74, 19.13, 0.11, 159.99, 19.36, 0.43, 'dark'],
      ['b', 159.74, 19.38, 0.11, 159.99, 19.64, 0.45, 'scarlet'], ['b', 159.74, 19.66, 0.11, 159.99, 19.86, 0.47, 'blue'], ['b', 159.74, 19.88, 0.11, 159.99, 20.11, 0.41, 'green'], ['b', 159.74, 20.13, 0.11, 159.99, 20.39, 0.43, 'leather'],
      ['b', 159.74, 20.41, 0.11, 159.99, 20.61, 0.45, 'dark'], ['b', 159.74, 20.63, 0.11, 159.99, 20.86, 0.47, 'scarlet'], ['b', 159.74, 20.88, 0.11, 159.99, 21.14, 0.41, 'blue'], ['b', 159.74, 21.16, 0.11, 159.99, 21.36, 0.43, 'green'],
      ['b', 159.74, 21.38, 0.11, 159.99, 21.61, 0.45, 'leather'], ['b', 159.74, 21.63, 0.11, 159.99, 21.89, 0.47, 'dark'], ['b', 159.74, 18.91, 0.51, 159.99, 19.14, 0.87, 'dark'], ['b', 159.74, 19.16, 0.51, 159.99, 19.42, 0.81, 'scarlet'],
      ['b', 159.74, 19.44, 0.51, 159.99, 19.64, 0.83, 'blue'], ['b', 159.74, 19.66, 0.51, 159.99, 19.89, 0.85, 'green'], ['b', 159.74, 19.91, 0.51, 159.99, 20.17, 0.87, 'leather'], ['b', 159.74, 20.19, 0.51, 159.99, 20.39, 0.81, 'dark'],
      ['b', 159.74, 20.41, 0.51, 159.99, 20.64, 0.83, 'scarlet'], ['b', 159.74, 20.66, 0.51, 159.99, 20.92, 0.85, 'blue'], ['b', 159.74, 20.94, 0.51, 159.99, 21.14, 0.87, 'green'], ['b', 159.74, 21.16, 0.51, 159.99, 21.39, 0.81, 'leather'],
      ['b', 159.74, 21.41, 0.51, 159.99, 21.67, 0.83, 'dark'], ['b', 159.74, 18.91, 0.91, 159.99, 19.17, 1.25, 'scarlet'], ['b', 159.74, 19.19, 0.91, 159.99, 19.39, 1.27, 'blue'], ['b', 159.74, 19.41, 0.91, 159.99, 19.64, 1.21, 'green'],
      ['b', 159.74, 19.66, 0.91, 159.99, 19.92, 1.23, 'leather'], ['b', 159.74, 19.94, 0.91, 159.99, 20.14, 1.25, 'dark'], ['b', 159.74, 20.16, 0.91, 159.99, 20.39, 1.27, 'scarlet'], ['b', 159.74, 20.41, 0.91, 159.99, 20.67, 1.21, 'blue'],
      ['b', 159.74, 20.69, 0.91, 159.99, 20.89, 1.23, 'green'], ['b', 159.74, 20.91, 0.91, 159.99, 21.14, 1.25, 'leather'], ['b', 159.74, 21.16, 0.91, 159.99, 21.42, 1.27, 'dark'], ['b', 159.74, 21.44, 0.91, 159.99, 21.64, 1.21, 'scarlet'],
      ['b', 159.74, 21.66, 0.91, 159.99, 21.89, 1.23, 'blue'], ['b', 159.74, 18.91, 1.31, 159.99, 19.11, 1.63, 'blue'], ['b', 159.74, 19.13, 1.31, 159.99, 19.36, 1.65, 'green'], ['b', 159.74, 19.38, 1.31, 159.99, 19.64, 1.67, 'leather'],
      ['b', 159.74, 19.66, 1.31, 159.99, 19.86, 1.61, 'dark'], ['b', 159.74, 19.88, 1.31, 159.99, 20.11, 1.63, 'scarlet'], ['b', 159.74, 20.13, 1.31, 159.99, 20.39, 1.65, 'blue'], ['b', 159.74, 20.41, 1.31, 159.99, 20.61, 1.67, 'green'],
      ['b', 159.74, 20.63, 1.31, 159.99, 20.86, 1.61, 'leather'], ['b', 159.74, 20.88, 1.31, 159.99, 21.14, 1.63, 'dark'], ['b', 159.74, 21.16, 1.31, 159.99, 21.36, 1.65, 'scarlet'], ['b', 159.74, 21.38, 1.31, 159.99, 21.61, 1.67, 'blue'],
      ['b', 159.74, 21.63, 1.31, 159.99, 21.89, 1.61, 'green'], ['b', 159.74, 18.91, 1.71, 159.99, 19.14, 2.01, 'green'], ['b', 159.74, 19.16, 1.71, 159.99, 19.42, 2.03, 'leather'], ['b', 159.74, 19.44, 1.71, 159.99, 19.64, 2.05, 'dark'],
      ['b', 159.74, 19.66, 1.71, 159.99, 19.89, 2.07, 'scarlet'], ['b', 159.74, 19.91, 1.71, 159.99, 20.17, 2.01, 'blue'], ['b', 159.74, 20.19, 1.71, 159.99, 20.39, 2.03, 'green'], ['b', 159.74, 20.41, 1.71, 159.99, 20.64, 2.05, 'leather'],
      ['b', 159.74, 20.66, 1.71, 159.99, 20.92, 2.07, 'dark'], ['b', 159.74, 20.94, 1.71, 159.99, 21.14, 2.01, 'scarlet'], ['b', 159.74, 21.16, 1.71, 159.99, 21.39, 2.03, 'blue'], ['b', 159.74, 21.41, 1.71, 159.99, 21.67, 2.05, 'green'],
      ['b', 160.01, 19.85, 1.7, 160.07, 20.65, 2.3, 'gilt'], ['b', 160.0, 19.9, 1.75, 160.07, 20.6, 2.25, 'dark'], ['b', 150.2, 20.83, 0, 151.1, 21.67, 0.4, 'leather'], ['b', 150.32, 20.83, 0.4, 150.98, 21.47, 0.48, 'dark'],
      ['b', 150.2, 21.47, 0.4, 151.1, 21.67, 1.0, 'leather'], ['b', 150.2, 20.83, 0.4, 150.32, 21.47, 0.62, 'leather'], ['b', 150.98, 20.83, 0.4, 151.1, 21.47, 0.62, 'leather'], ['b', 147.83, 19.8, 0, 148.05, 20.7, 0.012, 'stone']] },
    /* 3-THINGS end teachers-study-3-east */
    /* 3-THINGS teachers-study-3-lake-east */
    /* docs/interiors/upper-floors-gaps-1028.md (teachers-study-3-lake-east, teachers' studies): a writing desk with a windsor chair on a hearth rug, a bookcase and a longcase clock, an oil lamp; the leaf's sweep kept clear */
    'teachers-study-3-lake-east': { items: [
      ['t', 146.74, 15.15, 148.14, 15.85, 0.76, 'oak'], ['b', 146.79, 15.2, 0.45, 147.19, 15.8, 0.72, 'dark'], ['b', 146.84, 15.25, 0.76, 147.24, 15.6, 0.78, 'paper'], ['y', 147.89, 15.5, 0.06, 0.76, 0.79, 'brass'],
      ['y', 147.89, 15.5, 0.04, 0.79, 0.88, 'glass'], ['y', 147.89, 15.5, 0.025, 0.88, 1.06, 'glass'], ['t', 147.23, 14.49, 147.65, 14.91, 0.45, 'wood'], ['b', 147.23, 14.87, 0.45, 147.65, 14.91, 0.9, 'wood'],
      ['b', 146.34, 13.95, 0, 148.54, 16.15, 0.012, 'scarlet'], ['s', 147.35, 17.4, 150.35, 17.77, [0.1, 0.5, 0.9, 1.3000000000000003, 1.7000000000000002, 2.1], 'oak'], ['b', 147.41, 17.44, 0.11, 147.61, 17.69, 0.41, 'leather'], ['b', 147.63, 17.44, 0.11, 147.86, 17.69, 0.43, 'dark'],
      ['b', 147.88, 17.44, 0.11, 148.14, 17.69, 0.45, 'scarlet'], ['b', 148.16, 17.44, 0.11, 148.36, 17.69, 0.47, 'blue'], ['b', 148.38, 17.44, 0.11, 148.61, 17.69, 0.41, 'green'], ['b', 148.63, 17.44, 0.11, 148.89, 17.69, 0.43, 'leather'],
      ['b', 148.91, 17.44, 0.11, 149.11, 17.69, 0.45, 'dark'], ['b', 149.13, 17.44, 0.11, 149.36, 17.69, 0.47, 'scarlet'], ['b', 149.38, 17.44, 0.11, 149.64, 17.69, 0.41, 'blue'], ['b', 149.66, 17.44, 0.11, 149.86, 17.69, 0.43, 'green'],
      ['b', 149.88, 17.44, 0.11, 150.11, 17.69, 0.45, 'leather'], ['b', 150.13, 17.44, 0.11, 150.39, 17.69, 0.47, 'dark'], ['b', 147.41, 17.44, 0.51, 147.64, 17.69, 0.87, 'dark'], ['b', 147.66, 17.44, 0.51, 147.92, 17.69, 0.81, 'scarlet'],
      ['b', 147.94, 17.44, 0.51, 148.14, 17.69, 0.83, 'blue'], ['b', 148.16, 17.44, 0.51, 148.39, 17.69, 0.85, 'green'], ['b', 148.41, 17.44, 0.51, 148.67, 17.69, 0.87, 'leather'], ['b', 148.69, 17.44, 0.51, 148.89, 17.69, 0.81, 'dark'],
      ['b', 148.91, 17.44, 0.51, 149.14, 17.69, 0.83, 'scarlet'], ['b', 149.16, 17.44, 0.51, 149.42, 17.69, 0.85, 'blue'], ['b', 149.44, 17.44, 0.51, 149.64, 17.69, 0.87, 'green'], ['b', 149.66, 17.44, 0.51, 149.89, 17.69, 0.81, 'leather'],
      ['b', 149.91, 17.44, 0.51, 150.17, 17.69, 0.83, 'dark'], ['b', 147.41, 17.44, 0.91, 147.67, 17.69, 1.25, 'scarlet'], ['b', 147.69, 17.44, 0.91, 147.89, 17.69, 1.27, 'blue'], ['b', 147.91, 17.44, 0.91, 148.14, 17.69, 1.21, 'green'],
      ['b', 148.16, 17.44, 0.91, 148.42, 17.69, 1.23, 'leather'], ['b', 148.44, 17.44, 0.91, 148.64, 17.69, 1.25, 'dark'], ['b', 148.66, 17.44, 0.91, 148.89, 17.69, 1.27, 'scarlet'], ['b', 148.91, 17.44, 0.91, 149.17, 17.69, 1.21, 'blue'],
      ['b', 149.19, 17.44, 0.91, 149.39, 17.69, 1.23, 'green'], ['b', 149.41, 17.44, 0.91, 149.64, 17.69, 1.25, 'leather'], ['b', 149.66, 17.44, 0.91, 149.92, 17.69, 1.27, 'dark'], ['b', 149.94, 17.44, 0.91, 150.14, 17.69, 1.21, 'scarlet'],
      ['b', 150.16, 17.44, 0.91, 150.39, 17.69, 1.23, 'blue'], ['b', 147.41, 17.44, 1.31, 147.61, 17.69, 1.63, 'blue'], ['b', 147.63, 17.44, 1.31, 147.86, 17.69, 1.65, 'green'], ['b', 147.88, 17.44, 1.31, 148.14, 17.69, 1.67, 'leather'],
      ['b', 148.16, 17.44, 1.31, 148.36, 17.69, 1.61, 'dark'], ['b', 148.38, 17.44, 1.31, 148.61, 17.69, 1.63, 'scarlet'], ['b', 148.63, 17.44, 1.31, 148.89, 17.69, 1.65, 'blue'], ['b', 148.91, 17.44, 1.31, 149.11, 17.69, 1.67, 'green'],
      ['b', 149.13, 17.44, 1.31, 149.36, 17.69, 1.61, 'leather'], ['b', 149.38, 17.44, 1.31, 149.64, 17.69, 1.63, 'dark'], ['b', 149.66, 17.44, 1.31, 149.86, 17.69, 1.65, 'scarlet'], ['b', 149.88, 17.44, 1.31, 150.11, 17.69, 1.67, 'blue'],
      ['b', 150.13, 17.44, 1.31, 150.39, 17.69, 1.61, 'green'], ['b', 147.41, 17.44, 1.71, 147.64, 17.69, 2.01, 'green'], ['b', 147.66, 17.44, 1.71, 147.92, 17.69, 2.03, 'leather'], ['b', 147.94, 17.44, 1.71, 148.14, 17.69, 2.05, 'dark'],
      ['b', 148.16, 17.44, 1.71, 148.39, 17.69, 2.07, 'scarlet'], ['b', 148.41, 17.44, 1.71, 148.67, 17.69, 2.01, 'blue'], ['b', 148.69, 17.44, 1.71, 148.89, 17.69, 2.03, 'green'], ['b', 148.91, 17.44, 1.71, 149.14, 17.69, 2.05, 'leather'],
      ['b', 149.16, 17.44, 1.71, 149.42, 17.69, 2.07, 'dark'], ['b', 149.44, 17.44, 1.71, 149.64, 17.69, 2.01, 'scarlet'], ['b', 149.66, 17.44, 1.71, 149.89, 17.69, 2.03, 'blue'], ['b', 149.91, 17.44, 1.71, 150.17, 17.69, 2.05, 'green'],
      ['b', 150.75, 17.45, 0, 151.2, 17.77, 2.0, 'dark'], ['b', 142.21, 6.2, 0, 143.05, 7.1, 0.4, 'leather'], ['b', 142.41, 6.32, 0.4, 143.05, 6.98, 0.48, 'dark'], ['b', 142.21, 6.2, 0.4, 142.41, 7.1, 1.0, 'leather'],
      ['b', 142.41, 6.2, 0.4, 143.05, 6.32, 0.62, 'leather'], ['b', 142.41, 6.98, 0.4, 143.05, 7.1, 0.62, 'leather'], ['b', 146.99, 3.83, 0, 147.89, 4.05, 0.012, 'stone'], ['b', 153.05, 11.8, 0, 153.27, 12.7, 0.012, 'stone'],
      ['b', 145.65, 17.55, 0, 146.55, 17.77, 0.012, 'stone']] },
    /* 3-THINGS end teachers-study-3-lake-east */
    /* 3-THINGS teachers-study-3-north */
    /* docs/interiors/upper-floors-gaps-1028.md (teachers-study-3-north, teachers' studies): a writing desk with a windsor chair on a hearth rug, a bookcase and a longcase clock and one portrait, an oil lamp; the leaf's sweep kept clear */
    'teachers-study-3-north': { items: [
      ['t', 105.75, 69.15, 107.15, 69.85, 0.76, 'oak'], ['b', 105.8, 69.2, 0.45, 106.2, 69.8, 0.72, 'dark'], ['b', 105.85, 69.25, 0.76, 106.25, 69.6, 0.78, 'paper'], ['y', 106.9, 69.5, 0.06, 0.76, 0.79, 'brass'],
      ['y', 106.9, 69.5, 0.04, 0.79, 0.88, 'glass'], ['y', 106.9, 69.5, 0.025, 0.88, 1.06, 'glass'], ['t', 106.24, 68.49, 106.66, 68.91, 0.45, 'wood'], ['b', 106.24, 68.87, 0.45, 106.66, 68.91, 0.9, 'wood'],
      ['b', 105.35, 67.95, 0, 107.55, 70.15, 0.012, 'scarlet'], ['s', 100.95, 71.4, 103.95, 71.77, [0.1, 0.5, 0.9, 1.3000000000000003, 1.7000000000000002, 2.1], 'oak'], ['b', 101.01, 71.44, 0.11, 101.21, 71.69, 0.41, 'leather'], ['b', 101.23, 71.44, 0.11, 101.46, 71.69, 0.43, 'dark'],
      ['b', 101.48, 71.44, 0.11, 101.74, 71.69, 0.45, 'scarlet'], ['b', 101.76, 71.44, 0.11, 101.96, 71.69, 0.47, 'blue'], ['b', 101.98, 71.44, 0.11, 102.21, 71.69, 0.41, 'green'], ['b', 102.23, 71.44, 0.11, 102.49, 71.69, 0.43, 'leather'],
      ['b', 102.51, 71.44, 0.11, 102.71, 71.69, 0.45, 'dark'], ['b', 102.73, 71.44, 0.11, 102.96, 71.69, 0.47, 'scarlet'], ['b', 102.98, 71.44, 0.11, 103.24, 71.69, 0.41, 'blue'], ['b', 103.26, 71.44, 0.11, 103.46, 71.69, 0.43, 'green'],
      ['b', 103.48, 71.44, 0.11, 103.71, 71.69, 0.45, 'leather'], ['b', 103.73, 71.44, 0.11, 103.99, 71.69, 0.47, 'dark'], ['b', 101.01, 71.44, 0.51, 101.24, 71.69, 0.87, 'dark'], ['b', 101.26, 71.44, 0.51, 101.52, 71.69, 0.81, 'scarlet'],
      ['b', 101.54, 71.44, 0.51, 101.74, 71.69, 0.83, 'blue'], ['b', 101.76, 71.44, 0.51, 101.99, 71.69, 0.85, 'green'], ['b', 102.01, 71.44, 0.51, 102.27, 71.69, 0.87, 'leather'], ['b', 102.29, 71.44, 0.51, 102.49, 71.69, 0.81, 'dark'],
      ['b', 102.51, 71.44, 0.51, 102.74, 71.69, 0.83, 'scarlet'], ['b', 102.76, 71.44, 0.51, 103.02, 71.69, 0.85, 'blue'], ['b', 103.04, 71.44, 0.51, 103.24, 71.69, 0.87, 'green'], ['b', 103.26, 71.44, 0.51, 103.49, 71.69, 0.81, 'leather'],
      ['b', 103.51, 71.44, 0.51, 103.77, 71.69, 0.83, 'dark'], ['b', 101.01, 71.44, 0.91, 101.27, 71.69, 1.25, 'scarlet'], ['b', 101.29, 71.44, 0.91, 101.49, 71.69, 1.27, 'blue'], ['b', 101.51, 71.44, 0.91, 101.74, 71.69, 1.21, 'green'],
      ['b', 101.76, 71.44, 0.91, 102.02, 71.69, 1.23, 'leather'], ['b', 102.04, 71.44, 0.91, 102.24, 71.69, 1.25, 'dark'], ['b', 102.26, 71.44, 0.91, 102.49, 71.69, 1.27, 'scarlet'], ['b', 102.51, 71.44, 0.91, 102.77, 71.69, 1.21, 'blue'],
      ['b', 102.79, 71.44, 0.91, 102.99, 71.69, 1.23, 'green'], ['b', 103.01, 71.44, 0.91, 103.24, 71.69, 1.25, 'leather'], ['b', 103.26, 71.44, 0.91, 103.52, 71.69, 1.27, 'dark'], ['b', 103.54, 71.44, 0.91, 103.74, 71.69, 1.21, 'scarlet'],
      ['b', 103.76, 71.44, 0.91, 103.99, 71.69, 1.23, 'blue'], ['b', 101.01, 71.44, 1.31, 101.21, 71.69, 1.63, 'blue'], ['b', 101.23, 71.44, 1.31, 101.46, 71.69, 1.65, 'green'], ['b', 101.48, 71.44, 1.31, 101.74, 71.69, 1.67, 'leather'],
      ['b', 101.76, 71.44, 1.31, 101.96, 71.69, 1.61, 'dark'], ['b', 101.98, 71.44, 1.31, 102.21, 71.69, 1.63, 'scarlet'], ['b', 102.23, 71.44, 1.31, 102.49, 71.69, 1.65, 'blue'], ['b', 102.51, 71.44, 1.31, 102.71, 71.69, 1.67, 'green'],
      ['b', 102.73, 71.44, 1.31, 102.96, 71.69, 1.61, 'leather'], ['b', 102.98, 71.44, 1.31, 103.24, 71.69, 1.63, 'dark'], ['b', 103.26, 71.44, 1.31, 103.46, 71.69, 1.65, 'scarlet'], ['b', 103.48, 71.44, 1.31, 103.71, 71.69, 1.67, 'blue'],
      ['b', 103.73, 71.44, 1.31, 103.99, 71.69, 1.61, 'green'], ['b', 101.01, 71.44, 1.71, 101.24, 71.69, 2.01, 'green'], ['b', 101.26, 71.44, 1.71, 101.52, 71.69, 2.03, 'leather'], ['b', 101.54, 71.44, 1.71, 101.74, 71.69, 2.05, 'dark'],
      ['b', 101.76, 71.44, 1.71, 101.99, 71.69, 2.07, 'scarlet'], ['b', 102.01, 71.44, 1.71, 102.27, 71.69, 2.01, 'blue'], ['b', 102.29, 71.44, 1.71, 102.49, 71.69, 2.03, 'green'], ['b', 102.51, 71.44, 1.71, 102.74, 71.69, 2.05, 'leather'],
      ['b', 102.76, 71.44, 1.71, 103.02, 71.69, 2.07, 'dark'], ['b', 103.04, 71.44, 1.71, 103.24, 71.69, 2.01, 'scarlet'], ['b', 103.26, 71.44, 1.71, 103.49, 71.69, 2.03, 'blue'], ['b', 103.51, 71.44, 1.71, 103.77, 71.69, 2.05, 'green'],
      ['b', 104.35, 71.45, 0, 104.8, 71.77, 2.0, 'dark'], ['b', 106.05, 71.71, 1.7, 106.85, 71.77, 2.3, 'gilt'], ['b', 106.1, 71.7, 1.75, 106.8, 71.77, 2.25, 'dark'], ['b', 101.13, 61.6, 0, 101.97, 62.5, 0.4, 'leather'],
      ['b', 101.33, 61.72, 0.4, 101.97, 62.38, 0.48, 'dark'], ['b', 101.13, 61.6, 0.4, 101.33, 62.5, 1.0, 'leather'], ['b', 101.33, 61.6, 0.4, 101.97, 61.72, 0.62, 'leather'], ['b', 101.33, 62.38, 0.4, 101.97, 62.5, 0.62, 'leather'],
      ['b', 106.0, 59.23, 0, 106.9, 59.45, 0.012, 'stone']] },
    /* 3-THINGS end teachers-study-3-north */
    /* 3-THINGS defence-teachers-bedroom-3 */
    /* docs/interiors/upper-floors-gaps-1028.md (defence-teachers-bedroom-3, staff bedrooms): a four-poster, a bedside cupboard with an oil lamp, a wardrobe, a washstand, a writing desk and chair, a leather armchair on a rug; the bed heads against the inner wall; occupant to come */
    'defence-teachers-bedroom-3': { items: [
      ['b', 89.45, 70.0, 0.3, 90.4, 71.98, 0.36, 'iron'], ['b', 89.45, 70.0, 0, 89.49, 70.04, 0.3, 'iron'], ['b', 90.36, 70.0, 0, 90.4, 70.04, 0.3, 'iron'], ['b', 89.45, 71.94, 0, 89.49, 71.98, 0.3, 'iron'],
      ['b', 90.36, 71.94, 0, 90.4, 71.98, 0.3, 'iron'], ['b', 89.45, 71.94, 0.36, 90.4, 71.98, 1.05, 'iron'], ['b', 89.45, 70.0, 0.36, 90.4, 70.03, 0.6, 'iron'], ['b', 89.48, 70.03, 0.36, 90.37, 71.94, 0.5, 'linen'],
      ['b', 89.55, 71.5, 0.5, 90.3, 71.92, 0.58, 'white'], ['b', 89.48, 70.03, 0.5, 90.37, 70.8, 0.56, 'blue'], ['b', 90.45, 71.6, 0, 90.9, 72.02, 0.65, 'oak'], ['b', 90.45, 71.58, 0.65, 90.9, 72.02, 0.67, 'stone'],
      ['y', 90.67, 71.78, 0.06, 0.67, 0.7, 'brass'], ['y', 90.67, 71.78, 0.04, 0.7, 0.79, 'glass'], ['y', 90.67, 71.78, 0.025, 0.79, 0.97, 'glass'], ['b', 89.45, 70.0, 0.36, 89.51, 70.06, 1.9, 'dark'],
      ['b', 90.34, 70.0, 0.36, 90.4, 70.06, 1.9, 'dark'], ['b', 89.45, 70.0, 1.9, 90.4, 71.98, 1.95, 'dark'], ['b', 99.5, 70.6, 0, 100.07, 71.7, 2.0, 'oak'], ['b', 99.48, 71.14, 0.05, 100.07, 71.16, 1.95, 'dark'],
      ['b', 99.65, 61.55, 0, 100.07, 62.1, 0.85, 'oak'], ['b', 99.63, 61.54, 0.85, 100.07, 62.11, 0.88, 'stone'], ['y', 99.85, 61.825, 0.17, 0.88, 0.94, 'white'], ['t', 88.27, 61.85, 88.87, 63.05, 0.76, 'oak'],
      ['b', 88.31, 61.89, 0.45, 88.65, 62.25, 0.72, 'dark'], ['b', 88.35, 61.95, 0.76, 88.65, 62.3, 0.78, 'paper'], ['y', 88.75, 62.85, 0.06, 0.76, 0.79, 'brass'], ['y', 88.75, 62.85, 0.04, 0.79, 0.88, 'glass'],
      ['y', 88.75, 62.85, 0.025, 0.88, 1.06, 'glass'], ['t', 89.14, 62.24, 89.56, 62.66, 0.45, 'wood'], ['b', 89.52, 62.24, 0.45, 89.56, 62.66, 0.9, 'wood'], ['b', 95.41, 68.0, 0, 97.61, 69.7, 0.012, 'green'],
      ['b', 96.06, 68.38, 0, 96.96, 69.22, 0.4, 'leather'], ['b', 96.18, 68.38, 0.4, 96.84, 69.02, 0.48, 'dark'], ['b', 96.06, 69.02, 0.4, 96.96, 69.22, 1.0, 'leather'], ['b', 96.06, 68.38, 0.4, 96.18, 69.02, 0.62, 'leather'],
      ['b', 96.84, 68.38, 0.4, 96.96, 69.02, 0.62, 'leather'], ['b', 93.7, 59.23, 0, 94.6, 59.45, 0.012, 'stone']] },
    /* 3-THINGS end defence-teachers-bedroom-3 */
    /* 3-THINGS staff-bedrooms-3-lake */
    /* docs/interiors/upper-floors-gaps-1028.md (staff-bedrooms-3-lake, staff bedrooms): two iron bedsteads, a bedside cupboard with an oil lamp, a wardrobe, a washstand, a writing desk and chair, a leather armchair on a rug; the bed heads against the inner wall; occupant to come */
    'staff-bedrooms-3-lake': { items: [
      ['b', 53.04, 16.0, 0.3, 53.99, 17.98, 0.36, 'iron'], ['b', 53.04, 16.0, 0, 53.08, 16.04, 0.3, 'iron'], ['b', 53.95, 16.0, 0, 53.99, 16.04, 0.3, 'iron'], ['b', 53.04, 17.94, 0, 53.08, 17.98, 0.3, 'iron'],
      ['b', 53.95, 17.94, 0, 53.99, 17.98, 0.3, 'iron'], ['b', 53.04, 17.94, 0.36, 53.99, 17.98, 1.05, 'iron'], ['b', 53.04, 16.0, 0.36, 53.99, 16.03, 0.6, 'iron'], ['b', 53.07, 16.03, 0.36, 53.96, 17.94, 0.5, 'linen'],
      ['b', 53.14, 17.5, 0.5, 53.89, 17.92, 0.58, 'white'], ['b', 53.07, 16.03, 0.5, 53.96, 16.8, 0.56, 'blue'], ['b', 54.04, 17.6, 0, 54.49, 18.02, 0.65, 'oak'], ['b', 54.04, 17.58, 0.65, 54.49, 18.02, 0.67, 'stone'],
      ['y', 54.26, 17.78, 0.06, 0.67, 0.7, 'brass'], ['y', 54.26, 17.78, 0.04, 0.7, 0.79, 'glass'], ['y', 54.26, 17.78, 0.025, 0.79, 0.97, 'glass'], ['b', 65.35, 16.0, 0.3, 66.3, 17.98, 0.36, 'iron'],
      ['b', 65.35, 16.0, 0, 65.39, 16.04, 0.3, 'iron'], ['b', 66.26, 16.0, 0, 66.3, 16.04, 0.3, 'iron'], ['b', 65.35, 17.94, 0, 65.39, 17.98, 0.3, 'iron'], ['b', 66.26, 17.94, 0, 66.3, 17.98, 0.3, 'iron'],
      ['b', 65.35, 17.94, 0.36, 66.3, 17.98, 1.05, 'iron'], ['b', 65.35, 16.0, 0.36, 66.3, 16.03, 0.6, 'iron'], ['b', 65.38, 16.03, 0.36, 66.27, 17.94, 0.5, 'linen'], ['b', 65.45, 17.5, 0.5, 66.2, 17.92, 0.58, 'white'],
      ['b', 65.38, 16.03, 0.5, 66.27, 16.8, 0.56, 'scarlet'], ['b', 66.35, 17.6, 0, 66.8, 18.02, 0.65, 'oak'], ['b', 66.35, 17.58, 0.65, 66.8, 18.02, 0.67, 'stone'], ['y', 66.57, 17.78, 0.06, 0.67, 0.7, 'brass'],
      ['y', 66.57, 17.78, 0.04, 0.7, 0.79, 'glass'], ['y', 66.57, 17.78, 0.025, 0.79, 0.97, 'glass'], ['b', 67.2, 16.6, 0, 67.77, 17.7, 2.0, 'oak'], ['b', 67.18, 17.14, 0.05, 67.77, 17.16, 1.95, 'dark'],
      ['b', 67.35, 6.15, 0, 67.77, 6.7, 0.85, 'oak'], ['b', 67.33, 6.14, 0.85, 67.77, 6.71, 0.88, 'stone'], ['y', 67.55, 6.425, 0.17, 0.88, 0.94, 'white'], ['t', 51.86, 6.45, 52.46, 7.65, 0.76, 'oak'],
      ['b', 51.9, 6.49, 0.45, 52.24, 6.85, 0.72, 'dark'], ['b', 51.94, 6.55, 0.76, 52.24, 6.9, 0.78, 'paper'], ['y', 52.34, 7.45, 0.06, 0.76, 0.79, 'brass'], ['y', 52.34, 7.45, 0.04, 0.79, 0.88, 'glass'],
      ['y', 52.34, 7.45, 0.025, 0.88, 1.06, 'glass'], ['t', 52.73, 6.84, 53.15, 7.26, 0.45, 'wood'], ['b', 53.11, 6.84, 0.45, 53.15, 7.26, 0.9, 'wood'], ['b', 61.877, 14.0, 0, 64.077, 15.7, 0.012, 'green'],
      ['b', 62.527, 14.38, 0, 63.427, 15.22, 0.4, 'leather'], ['b', 62.647, 14.38, 0.4, 63.307, 15.02, 0.48, 'dark'], ['b', 62.527, 15.02, 0.4, 63.427, 15.22, 1.0, 'leather'], ['b', 62.527, 14.38, 0.4, 62.647, 15.02, 0.62, 'leather'],
      ['b', 63.307, 14.38, 0.4, 63.427, 15.02, 0.62, 'leather'], ['b', 57.85, 3.83, 0, 58.75, 4.05, 0.012, 'stone']] },
    /* 3-THINGS end staff-bedrooms-3-lake */
    /* 3-THINGS staff-bedroom-3-lake */
    /* docs/interiors/upper-floors-gaps-1028.md (staff-bedroom-3-lake, staff bedrooms): an iron bedstead, a bedside cupboard with an oil lamp, a wardrobe, a washstand, a writing desk and chair, a leather armchair on a rug; the bed heads against the inner wall; occupant to come */
    'staff-bedroom-3-lake': { items: [
      ['b', 106.47, 16.0, 0.3, 107.42, 17.98, 0.36, 'iron'], ['b', 106.47, 16.0, 0, 106.51, 16.04, 0.3, 'iron'], ['b', 107.38, 16.0, 0, 107.42, 16.04, 0.3, 'iron'], ['b', 106.47, 17.94, 0, 106.51, 17.98, 0.3, 'iron'],
      ['b', 107.38, 17.94, 0, 107.42, 17.98, 0.3, 'iron'], ['b', 106.47, 17.94, 0.36, 107.42, 17.98, 1.05, 'iron'], ['b', 106.47, 16.0, 0.36, 107.42, 16.03, 0.6, 'iron'], ['b', 106.5, 16.03, 0.36, 107.39, 17.94, 0.5, 'linen'],
      ['b', 106.57, 17.5, 0.5, 107.32, 17.92, 0.58, 'white'], ['b', 106.5, 16.03, 0.5, 107.39, 16.8, 0.56, 'blue'], ['b', 107.47, 17.6, 0, 107.92, 18.02, 0.65, 'oak'], ['b', 107.47, 17.58, 0.65, 107.92, 18.02, 0.67, 'stone'],
      ['y', 107.69, 17.78, 0.06, 0.67, 0.7, 'brass'], ['y', 107.69, 17.78, 0.04, 0.7, 0.79, 'glass'], ['y', 107.69, 17.78, 0.025, 0.79, 0.97, 'glass'], ['b', 116.34, 16.6, 0, 116.91, 17.7, 2.0, 'oak'],
      ['b', 116.32, 17.14, 0.05, 116.91, 17.16, 1.95, 'dark'], ['b', 116.49, 6.15, 0, 116.91, 6.7, 0.85, 'oak'], ['b', 116.47, 6.14, 0.85, 116.91, 6.71, 0.88, 'stone'], ['y', 116.69, 6.425, 0.17, 0.88, 0.94, 'white'],
      ['t', 105.29, 6.45, 105.89, 7.65, 0.76, 'oak'], ['b', 105.33, 6.49, 0.45, 105.67, 6.85, 0.72, 'dark'], ['b', 105.37, 6.55, 0.76, 105.67, 6.9, 0.78, 'paper'], ['y', 105.77, 7.45, 0.06, 0.76, 0.79, 'brass'],
      ['y', 105.77, 7.45, 0.04, 0.79, 0.88, 'glass'], ['y', 105.77, 7.45, 0.025, 0.88, 1.06, 'glass'], ['t', 106.16, 6.84, 106.58, 7.26, 0.45, 'wood'], ['b', 106.54, 6.84, 0.45, 106.58, 7.26, 0.9, 'wood'],
      ['b', 112.304, 14.0, 0, 114.504, 15.7, 0.012, 'green'], ['b', 112.954, 14.38, 0, 113.854, 15.22, 0.4, 'leather'], ['b', 113.074, 14.38, 0.4, 113.734, 15.02, 0.48, 'dark'], ['b', 112.954, 15.02, 0.4, 113.854, 15.22, 1.0, 'leather'],
      ['b', 112.954, 14.38, 0.4, 113.074, 15.02, 0.62, 'leather'], ['b', 113.734, 14.38, 0.4, 113.854, 15.02, 0.62, 'leather'], ['b', 110.63, 3.83, 0, 111.53, 4.05, 0.012, 'stone']] },
    /* 3-THINGS end staff-bedroom-3-lake */
    /* 3-THINGS store-3-east */
    /* docs/interiors/upper-floors-gaps-1028.md (store-3-east, plain stores): book crates stacked two high, boarded chests and sacks along the back wall, a school trunk by the door; a 1.0 aisle */
    'store-3-east': { items: [
      ['b', 135.65, 53.85, 0, 136.25, 54.3, 0.4, 'deal'], ['b', 135.65, 53.85, 0.4, 136.25, 54.3, 0.8, 'deal'], ['b', 135.7, 53.9, 0.4, 136.2, 54.25, 0.43, 'paper'], ['b', 134.95, 53.85, 0, 135.55, 54.3, 0.4, 'deal'],
      ['b', 135.0, 53.9, 0.4, 135.5, 54.25, 0.43, 'paper'], ['y', 134.55, 54.075, 0.23, 0, 0.7, 'canvas'], ['b', 133.55, 53.85, 0, 134.15, 54.3, 0.5, 'oak'], ['b', 133.55, 53.85, 0.5, 134.15, 54.3, 0.54, 'iron'],
      ['b', 132.85, 53.85, 0, 133.45, 54.3, 0.4, 'deal'], ['b', 132.85, 53.85, 0.4, 133.45, 54.3, 0.8, 'deal'], ['b', 132.9, 53.9, 0.4, 133.4, 54.25, 0.43, 'paper'], ['b', 132.15, 53.85, 0, 132.75, 54.3, 0.4, 'deal'],
      ['b', 132.2, 53.9, 0.4, 132.7, 54.25, 0.43, 'paper'], ['y', 131.75, 54.075, 0.23, 0, 0.7, 'canvas'], ['b', 130.75, 53.85, 0, 131.35, 54.3, 0.5, 'oak'], ['b', 130.75, 53.85, 0.5, 131.35, 54.3, 0.54, 'iron'],
      ['b', 130.05, 53.85, 0, 130.65, 54.3, 0.4, 'deal'], ['b', 130.05, 53.85, 0.4, 130.65, 54.3, 0.8, 'deal'], ['b', 130.1, 53.9, 0.4, 130.6, 54.25, 0.43, 'paper'], ['b', 129.35, 53.85, 0, 129.95, 54.3, 0.4, 'deal'],
      ['b', 129.4, 53.9, 0.4, 129.9, 54.25, 0.43, 'paper'], ['y', 128.95, 54.075, 0.23, 0, 0.7, 'canvas'], ['b', 127.95, 53.85, 0, 128.55, 54.3, 0.5, 'oak'], ['b', 127.95, 53.85, 0.5, 128.55, 54.3, 0.54, 'iron'],
      ['b', 127.25, 53.85, 0, 127.85, 54.3, 0.4, 'deal'], ['b', 127.25, 53.85, 0.4, 127.85, 54.3, 0.8, 'deal'], ['b', 127.3, 53.9, 0.4, 127.8, 54.25, 0.43, 'paper'], ['b', 126.55, 53.85, 0, 127.15, 54.3, 0.4, 'deal'],
      ['b', 126.6, 53.9, 0.4, 127.1, 54.25, 0.43, 'paper'], ['y', 126.15, 54.075, 0.23, 0, 0.7, 'canvas'], ['b', 125.15, 53.85, 0, 125.75, 54.3, 0.5, 'oak'], ['b', 125.15, 53.85, 0.5, 125.75, 54.3, 0.54, 'iron'],
      ['b', 124.45, 53.85, 0, 125.05, 54.3, 0.4, 'deal'], ['b', 124.45, 53.85, 0.4, 125.05, 54.3, 0.8, 'deal'], ['b', 124.5, 53.9, 0.4, 125.0, 54.25, 0.43, 'paper'], ['b', 123.75, 53.85, 0, 124.35, 54.3, 0.4, 'deal'],
      ['b', 123.8, 53.9, 0.4, 124.3, 54.25, 0.43, 'paper'], ['y', 123.35, 54.075, 0.23, 0, 0.7, 'canvas'], ['b', 122.35, 53.85, 0, 122.95, 54.3, 0.5, 'oak'], ['b', 122.35, 53.85, 0.5, 122.95, 54.3, 0.54, 'iron'],
      ['b', 121.65, 53.85, 0, 122.25, 54.3, 0.4, 'deal'], ['b', 121.65, 53.85, 0.4, 122.25, 54.3, 0.8, 'deal'], ['b', 121.7, 53.9, 0.4, 122.2, 54.25, 0.43, 'paper'], ['b', 120.95, 53.85, 0, 121.55, 54.3, 0.4, 'deal'],
      ['b', 121.0, 53.9, 0.4, 121.5, 54.25, 0.43, 'paper'], ['y', 120.55, 54.075, 0.23, 0, 0.7, 'canvas'], ['b', 119.55, 53.85, 0, 120.15, 54.3, 0.5, 'oak'], ['b', 119.55, 53.85, 0.5, 120.15, 54.3, 0.54, 'iron'],
      ['b', 118.85, 53.85, 0, 119.45, 54.3, 0.4, 'deal'], ['b', 118.85, 53.85, 0.4, 119.45, 54.3, 0.8, 'deal'], ['b', 118.9, 53.9, 0.4, 119.4, 54.25, 0.43, 'paper'], ['b', 118.15, 53.85, 0, 118.75, 54.3, 0.4, 'deal'],
      ['b', 118.2, 53.9, 0.4, 118.7, 54.25, 0.43, 'paper'], ['y', 117.75, 54.075, 0.23, 0, 0.7, 'canvas'], ['b', 116.75, 53.85, 0, 117.35, 54.3, 0.5, 'oak'], ['b', 116.75, 53.85, 0.5, 117.35, 54.3, 0.54, 'iron'],
      ['b', 116.05, 53.85, 0, 116.65, 54.3, 0.4, 'deal'], ['b', 116.05, 53.85, 0.4, 116.65, 54.3, 0.8, 'deal'], ['b', 116.1, 53.9, 0.4, 116.6, 54.25, 0.43, 'paper'], ['b', 115.35, 53.85, 0, 115.95, 54.3, 0.4, 'deal'],
      ['b', 115.4, 53.9, 0.4, 115.9, 54.25, 0.43, 'paper'], ['y', 114.95, 54.075, 0.23, 0, 0.7, 'canvas'], ['b', 135.55, 57.1, 0, 136.25, 57.55, 0.4, 'leather'], ['b', 135.55, 57.1, 0.4, 136.25, 57.55, 0.43, 'iron'],
      ['b', 124.8, 57.35, 0, 125.7, 57.57, 0.012, 'stone']] },
    /* 3-THINGS end store-3-east */
    /* 3-THINGS spare-desks-store-3-west */
    /* docs/interiors/upper-floors-gaps-1028.md (spare-desks-store-3-west, spare desks and chairs): single and double desks stacked two high along the back wall, joint stools on the door wall beyond the leaf, a bench on its end; the door's aisle is clear */
    'spare-desks-store-3-west': { items: [
      ['b', 21.25, 54.15, 0.72, 22.45, 54.6, 0.76, 'oak'], ['b', 22.39, 54.54, 0.0, 22.42, 54.57, 0.72, 'oak'], ['b', 22.39, 54.18, 0.0, 22.42, 54.21, 0.72, 'oak'], ['b', 21.28, 54.54, 0.0, 21.31, 54.57, 0.72, 'oak'],
      ['b', 21.28, 54.18, 0.0, 21.31, 54.21, 0.72, 'oak'], ['b', 21.25, 54.15, 1.48, 22.45, 54.6, 1.52, 'oak'], ['b', 22.39, 54.54, 0.76, 22.42, 54.57, 1.48, 'oak'], ['b', 22.39, 54.18, 0.76, 22.42, 54.21, 1.48, 'oak'],
      ['b', 21.28, 54.54, 0.76, 21.31, 54.57, 1.48, 'oak'], ['b', 21.28, 54.18, 0.76, 21.31, 54.21, 1.48, 'oak'], ['b', 20.55, 54.15, 0.72, 21.15, 54.6, 0.76, 'oak'], ['b', 21.09, 54.54, 0.0, 21.12, 54.57, 0.72, 'oak'],
      ['b', 21.09, 54.18, 0.0, 21.12, 54.21, 0.72, 'oak'], ['b', 20.58, 54.54, 0.0, 20.61, 54.57, 0.72, 'oak'], ['b', 20.58, 54.18, 0.0, 20.61, 54.21, 0.72, 'oak'], ['b', 20.55, 54.15, 1.48, 21.15, 54.6, 1.52, 'oak'],
      ['b', 21.09, 54.54, 0.76, 21.12, 54.57, 1.48, 'oak'], ['b', 21.09, 54.18, 0.76, 21.12, 54.21, 1.48, 'oak'], ['b', 20.58, 54.54, 0.76, 20.61, 54.57, 1.48, 'oak'], ['b', 20.58, 54.18, 0.76, 20.61, 54.21, 1.48, 'oak'],
      ['b', 19.85, 54.15, 0.72, 20.45, 54.6, 0.76, 'oak'], ['b', 20.39, 54.54, 0.0, 20.42, 54.57, 0.72, 'oak'], ['b', 20.39, 54.18, 0.0, 20.42, 54.21, 0.72, 'oak'], ['b', 19.88, 54.54, 0.0, 19.91, 54.57, 0.72, 'oak'],
      ['b', 19.88, 54.18, 0.0, 19.91, 54.21, 0.72, 'oak'], ['b', 19.85, 54.15, 1.48, 20.45, 54.6, 1.52, 'oak'], ['b', 20.39, 54.54, 0.76, 20.42, 54.57, 1.48, 'oak'], ['b', 20.39, 54.18, 0.76, 20.42, 54.21, 1.48, 'oak'],
      ['b', 19.88, 54.54, 0.76, 19.91, 54.57, 1.48, 'oak'], ['b', 19.88, 54.18, 0.76, 19.91, 54.21, 1.48, 'oak'], ['b', 18.55, 54.15, 0.72, 19.75, 54.6, 0.76, 'oak'], ['b', 19.69, 54.54, 0.0, 19.72, 54.57, 0.72, 'oak'],
      ['b', 19.69, 54.18, 0.0, 19.72, 54.21, 0.72, 'oak'], ['b', 18.58, 54.54, 0.0, 18.61, 54.57, 0.72, 'oak'], ['b', 18.58, 54.18, 0.0, 18.61, 54.21, 0.72, 'oak'], ['b', 18.55, 54.15, 1.48, 19.75, 54.6, 1.52, 'oak'],
      ['b', 19.69, 54.54, 0.76, 19.72, 54.57, 1.48, 'oak'], ['b', 19.69, 54.18, 0.76, 19.72, 54.21, 1.48, 'oak'], ['b', 18.58, 54.54, 0.76, 18.61, 54.57, 1.48, 'oak'], ['b', 18.58, 54.18, 0.76, 18.61, 54.21, 1.48, 'oak'],
      ['b', 17.85, 54.15, 0.72, 18.45, 54.6, 0.76, 'oak'], ['b', 18.39, 54.54, 0.0, 18.42, 54.57, 0.72, 'oak'], ['b', 18.39, 54.18, 0.0, 18.42, 54.21, 0.72, 'oak'], ['b', 17.88, 54.54, 0.0, 17.91, 54.57, 0.72, 'oak'],
      ['b', 17.88, 54.18, 0.0, 17.91, 54.21, 0.72, 'oak'], ['b', 17.85, 54.15, 1.48, 18.45, 54.6, 1.52, 'oak'], ['b', 18.39, 54.54, 0.76, 18.42, 54.57, 1.48, 'oak'], ['b', 18.39, 54.18, 0.76, 18.42, 54.21, 1.48, 'oak'],
      ['b', 17.88, 54.54, 0.76, 17.91, 54.57, 1.48, 'oak'], ['b', 17.88, 54.18, 0.76, 17.91, 54.21, 1.48, 'oak'], ['b', 17.15, 54.15, 0.72, 17.75, 54.6, 0.76, 'oak'], ['b', 17.69, 54.54, 0.0, 17.72, 54.57, 0.72, 'oak'],
      ['b', 17.69, 54.18, 0.0, 17.72, 54.21, 0.72, 'oak'], ['b', 17.18, 54.54, 0.0, 17.21, 54.57, 0.72, 'oak'], ['b', 17.18, 54.18, 0.0, 17.21, 54.21, 0.72, 'oak'], ['b', 17.15, 54.15, 1.48, 17.75, 54.6, 1.52, 'oak'],
      ['b', 17.69, 54.54, 0.76, 17.72, 54.57, 1.48, 'oak'], ['b', 17.69, 54.18, 0.76, 17.72, 54.21, 1.48, 'oak'], ['b', 17.18, 54.54, 0.76, 17.21, 54.57, 1.48, 'oak'], ['b', 17.18, 54.18, 0.76, 17.21, 54.21, 1.48, 'oak'],
      ['b', 15.85, 54.15, 0.72, 17.05, 54.6, 0.76, 'oak'], ['b', 16.99, 54.54, 0.0, 17.02, 54.57, 0.72, 'oak'], ['b', 16.99, 54.18, 0.0, 17.02, 54.21, 0.72, 'oak'], ['b', 15.88, 54.54, 0.0, 15.91, 54.57, 0.72, 'oak'],
      ['b', 15.88, 54.18, 0.0, 15.91, 54.21, 0.72, 'oak'], ['b', 15.85, 54.15, 1.48, 17.05, 54.6, 1.52, 'oak'], ['b', 16.99, 54.54, 0.76, 17.02, 54.57, 1.48, 'oak'], ['b', 16.99, 54.18, 0.76, 17.02, 54.21, 1.48, 'oak'],
      ['b', 15.88, 54.54, 0.76, 15.91, 54.57, 1.48, 'oak'], ['b', 15.88, 54.18, 0.76, 15.91, 54.21, 1.48, 'oak'], ['b', 15.15, 54.15, 0.72, 15.75, 54.6, 0.76, 'oak'], ['b', 15.69, 54.54, 0.0, 15.72, 54.57, 0.72, 'oak'],
      ['b', 15.69, 54.18, 0.0, 15.72, 54.21, 0.72, 'oak'], ['b', 15.18, 54.54, 0.0, 15.21, 54.57, 0.72, 'oak'], ['b', 15.18, 54.18, 0.0, 15.21, 54.21, 0.72, 'oak'], ['b', 15.15, 54.15, 1.48, 15.75, 54.6, 1.52, 'oak'],
      ['b', 15.69, 54.54, 0.76, 15.72, 54.57, 1.48, 'oak'], ['b', 15.69, 54.18, 0.76, 15.72, 54.21, 1.48, 'oak'], ['b', 15.18, 54.54, 0.76, 15.21, 54.57, 1.48, 'oak'], ['b', 15.18, 54.18, 0.76, 15.21, 54.21, 1.48, 'oak'],
      ['b', 14.45, 54.15, 0.72, 15.05, 54.6, 0.76, 'oak'], ['b', 14.99, 54.54, 0.0, 15.02, 54.57, 0.72, 'oak'], ['b', 14.99, 54.18, 0.0, 15.02, 54.21, 0.72, 'oak'], ['b', 14.48, 54.54, 0.0, 14.51, 54.57, 0.72, 'oak'],
      ['b', 14.48, 54.18, 0.0, 14.51, 54.21, 0.72, 'oak'], ['b', 14.45, 54.15, 1.48, 15.05, 54.6, 1.52, 'oak'], ['b', 14.99, 54.54, 0.76, 15.02, 54.57, 1.48, 'oak'], ['b', 14.99, 54.18, 0.76, 15.02, 54.21, 1.48, 'oak'],
      ['b', 14.48, 54.54, 0.76, 14.51, 54.57, 1.48, 'oak'], ['b', 14.48, 54.18, 0.76, 14.51, 54.21, 1.48, 'oak'], ['b', 13.15, 54.15, 0.72, 14.35, 54.6, 0.76, 'oak'], ['b', 14.29, 54.54, 0.0, 14.32, 54.57, 0.72, 'oak'],
      ['b', 14.29, 54.18, 0.0, 14.32, 54.21, 0.72, 'oak'], ['b', 13.18, 54.54, 0.0, 13.21, 54.57, 0.72, 'oak'], ['b', 13.18, 54.18, 0.0, 13.21, 54.21, 0.72, 'oak'], ['b', 13.15, 54.15, 1.48, 14.35, 54.6, 1.52, 'oak'],
      ['b', 14.29, 54.54, 0.76, 14.32, 54.57, 1.48, 'oak'], ['b', 14.29, 54.18, 0.76, 14.32, 54.21, 1.48, 'oak'], ['b', 13.18, 54.54, 0.76, 13.21, 54.57, 1.48, 'oak'], ['b', 13.18, 54.18, 0.76, 13.21, 54.21, 1.48, 'oak'],
      ['b', 12.45, 54.15, 0.72, 13.05, 54.6, 0.76, 'oak'], ['b', 12.99, 54.54, 0.0, 13.02, 54.57, 0.72, 'oak'], ['b', 12.99, 54.18, 0.0, 13.02, 54.21, 0.72, 'oak'], ['b', 12.48, 54.54, 0.0, 12.51, 54.57, 0.72, 'oak'],
      ['b', 12.48, 54.18, 0.0, 12.51, 54.21, 0.72, 'oak'], ['b', 12.45, 54.15, 1.48, 13.05, 54.6, 1.52, 'oak'], ['b', 12.99, 54.54, 0.76, 13.02, 54.57, 1.48, 'oak'], ['b', 12.99, 54.18, 0.76, 13.02, 54.21, 1.48, 'oak'],
      ['b', 12.48, 54.54, 0.76, 12.51, 54.57, 1.48, 'oak'], ['b', 12.48, 54.18, 0.76, 12.51, 54.21, 1.48, 'oak'], ['b', 22.2, 57.1, 0.41, 22.5, 57.4, 0.45, 'wood'], ['b', 22.22, 57.12, 0, 22.25, 57.15, 0.41, 'wood'],
      ['b', 22.22, 57.35, 0, 22.25, 57.38, 0.41, 'wood'], ['b', 22.45, 57.12, 0, 22.48, 57.15, 0.41, 'wood'], ['b', 22.45, 57.35, 0, 22.48, 57.38, 0.41, 'wood'], ['b', 21.8, 57.1, 0.41, 22.1, 57.4, 0.45, 'wood'],
      ['b', 21.82, 57.12, 0, 21.85, 57.15, 0.41, 'wood'], ['b', 21.82, 57.35, 0, 21.85, 57.38, 0.41, 'wood'], ['b', 22.05, 57.12, 0, 22.08, 57.15, 0.41, 'wood'], ['b', 22.05, 57.35, 0, 22.08, 57.38, 0.41, 'wood'],
      ['b', 21.4, 57.1, 0.41, 21.7, 57.4, 0.45, 'wood'], ['b', 21.42, 57.12, 0, 21.45, 57.15, 0.41, 'wood'], ['b', 21.42, 57.35, 0, 21.45, 57.38, 0.41, 'wood'], ['b', 21.65, 57.12, 0, 21.68, 57.15, 0.41, 'wood'],
      ['b', 21.65, 57.35, 0, 21.68, 57.38, 0.41, 'wood'], ['b', 21.0, 57.1, 0.41, 21.3, 57.4, 0.45, 'wood'], ['b', 21.02, 57.12, 0, 21.05, 57.15, 0.41, 'wood'], ['b', 21.02, 57.35, 0, 21.05, 57.38, 0.41, 'wood'],
      ['b', 21.25, 57.12, 0, 21.28, 57.15, 0.41, 'wood'], ['b', 21.25, 57.35, 0, 21.28, 57.38, 0.41, 'wood'], ['b', 20.6, 57.1, 0.41, 20.9, 57.4, 0.45, 'wood'], ['b', 20.62, 57.12, 0, 20.65, 57.15, 0.41, 'wood'],
      ['b', 20.62, 57.35, 0, 20.65, 57.38, 0.41, 'wood'], ['b', 20.85, 57.12, 0, 20.88, 57.15, 0.41, 'wood'], ['b', 20.85, 57.35, 0, 20.88, 57.38, 0.41, 'wood'], ['b', 20.2, 57.1, 0.41, 20.5, 57.4, 0.45, 'wood'],
      ['b', 20.22, 57.12, 0, 20.25, 57.15, 0.41, 'wood'], ['b', 20.22, 57.35, 0, 20.25, 57.38, 0.41, 'wood'], ['b', 20.45, 57.12, 0, 20.48, 57.15, 0.41, 'wood'], ['b', 20.45, 57.35, 0, 20.48, 57.38, 0.41, 'wood'],
      ['b', 15.25, 57.1, 0.41, 15.55, 57.4, 0.45, 'wood'], ['b', 15.27, 57.12, 0, 15.3, 57.15, 0.41, 'wood'], ['b', 15.27, 57.35, 0, 15.3, 57.38, 0.41, 'wood'], ['b', 15.5, 57.12, 0, 15.53, 57.15, 0.41, 'wood'],
      ['b', 15.5, 57.35, 0, 15.53, 57.38, 0.41, 'wood'], ['b', 14.85, 57.1, 0.41, 15.15, 57.4, 0.45, 'wood'], ['b', 14.87, 57.12, 0, 14.9, 57.15, 0.41, 'wood'], ['b', 14.87, 57.35, 0, 14.9, 57.38, 0.41, 'wood'],
      ['b', 15.1, 57.12, 0, 15.13, 57.15, 0.41, 'wood'], ['b', 15.1, 57.35, 0, 15.13, 57.38, 0.41, 'wood'], ['b', 14.45, 57.1, 0.41, 14.75, 57.4, 0.45, 'wood'], ['b', 14.47, 57.12, 0, 14.5, 57.15, 0.41, 'wood'],
      ['b', 14.47, 57.35, 0, 14.5, 57.38, 0.41, 'wood'], ['b', 14.7, 57.12, 0, 14.73, 57.15, 0.41, 'wood'], ['b', 14.7, 57.35, 0, 14.73, 57.38, 0.41, 'wood'], ['b', 14.05, 57.1, 0.41, 14.35, 57.4, 0.45, 'wood'],
      ['b', 14.07, 57.12, 0, 14.1, 57.15, 0.41, 'wood'], ['b', 14.07, 57.35, 0, 14.1, 57.38, 0.41, 'wood'], ['b', 14.3, 57.12, 0, 14.33, 57.15, 0.41, 'wood'], ['b', 14.3, 57.35, 0, 14.33, 57.38, 0.41, 'wood'],
      ['b', 13.65, 57.1, 0.41, 13.95, 57.4, 0.45, 'wood'], ['b', 13.67, 57.12, 0, 13.7, 57.15, 0.41, 'wood'], ['b', 13.67, 57.35, 0, 13.7, 57.38, 0.41, 'wood'], ['b', 13.9, 57.12, 0, 13.93, 57.15, 0.41, 'wood'],
      ['b', 13.9, 57.35, 0, 13.93, 57.38, 0.41, 'wood'], ['b', 13.25, 57.1, 0.41, 13.55, 57.4, 0.45, 'wood'], ['b', 13.27, 57.12, 0, 13.3, 57.15, 0.41, 'wood'], ['b', 13.27, 57.35, 0, 13.3, 57.38, 0.41, 'wood'],
      ['b', 13.5, 57.12, 0, 13.53, 57.15, 0.41, 'wood'], ['b', 13.5, 57.35, 0, 13.53, 57.38, 0.41, 'wood'], ['b', 11.63, 56.75, 0, 11.69, 57.05, 1.4, 'wood'], ['b', 16.8, 57.35, 0, 17.7, 57.57, 0.012, 'stone']] },
    /* 3-THINGS end spare-desks-store-3-west */
    /* 3-THINGS spare-desks-store-3-middle */
    /* docs/interiors/upper-floors-gaps-1028.md (spare-desks-store-3-middle, spare desks and chairs): single and double desks stacked two high along the back wall, joint stools on the door wall beyond the leaf, a bench on its end; the door's aisle is clear */
    'spare-desks-store-3-middle': { items: [
      ['b', 94.25, 53.85, 0.72, 95.45, 54.3, 0.76, 'oak'], ['b', 95.39, 54.24, 0.0, 95.42, 54.27, 0.72, 'oak'], ['b', 95.39, 53.88, 0.0, 95.42, 53.91, 0.72, 'oak'], ['b', 94.28, 54.24, 0.0, 94.31, 54.27, 0.72, 'oak'],
      ['b', 94.28, 53.88, 0.0, 94.31, 53.91, 0.72, 'oak'], ['b', 94.25, 53.85, 1.48, 95.45, 54.3, 1.52, 'oak'], ['b', 95.39, 54.24, 0.76, 95.42, 54.27, 1.48, 'oak'], ['b', 95.39, 53.88, 0.76, 95.42, 53.91, 1.48, 'oak'],
      ['b', 94.28, 54.24, 0.76, 94.31, 54.27, 1.48, 'oak'], ['b', 94.28, 53.88, 0.76, 94.31, 53.91, 1.48, 'oak'], ['b', 93.55, 53.85, 0.72, 94.15, 54.3, 0.76, 'oak'], ['b', 94.09, 54.24, 0.0, 94.12, 54.27, 0.72, 'oak'],
      ['b', 94.09, 53.88, 0.0, 94.12, 53.91, 0.72, 'oak'], ['b', 93.58, 54.24, 0.0, 93.61, 54.27, 0.72, 'oak'], ['b', 93.58, 53.88, 0.0, 93.61, 53.91, 0.72, 'oak'], ['b', 93.55, 53.85, 1.48, 94.15, 54.3, 1.52, 'oak'],
      ['b', 94.09, 54.24, 0.76, 94.12, 54.27, 1.48, 'oak'], ['b', 94.09, 53.88, 0.76, 94.12, 53.91, 1.48, 'oak'], ['b', 93.58, 54.24, 0.76, 93.61, 54.27, 1.48, 'oak'], ['b', 93.58, 53.88, 0.76, 93.61, 53.91, 1.48, 'oak'],
      ['b', 92.85, 53.85, 0.72, 93.45, 54.3, 0.76, 'oak'], ['b', 93.39, 54.24, 0.0, 93.42, 54.27, 0.72, 'oak'], ['b', 93.39, 53.88, 0.0, 93.42, 53.91, 0.72, 'oak'], ['b', 92.88, 54.24, 0.0, 92.91, 54.27, 0.72, 'oak'],
      ['b', 92.88, 53.88, 0.0, 92.91, 53.91, 0.72, 'oak'], ['b', 92.85, 53.85, 1.48, 93.45, 54.3, 1.52, 'oak'], ['b', 93.39, 54.24, 0.76, 93.42, 54.27, 1.48, 'oak'], ['b', 93.39, 53.88, 0.76, 93.42, 53.91, 1.48, 'oak'],
      ['b', 92.88, 54.24, 0.76, 92.91, 54.27, 1.48, 'oak'], ['b', 92.88, 53.88, 0.76, 92.91, 53.91, 1.48, 'oak'], ['b', 91.55, 53.85, 0.72, 92.75, 54.3, 0.76, 'oak'], ['b', 92.69, 54.24, 0.0, 92.72, 54.27, 0.72, 'oak'],
      ['b', 92.69, 53.88, 0.0, 92.72, 53.91, 0.72, 'oak'], ['b', 91.58, 54.24, 0.0, 91.61, 54.27, 0.72, 'oak'], ['b', 91.58, 53.88, 0.0, 91.61, 53.91, 0.72, 'oak'], ['b', 91.55, 53.85, 1.48, 92.75, 54.3, 1.52, 'oak'],
      ['b', 92.69, 54.24, 0.76, 92.72, 54.27, 1.48, 'oak'], ['b', 92.69, 53.88, 0.76, 92.72, 53.91, 1.48, 'oak'], ['b', 91.58, 54.24, 0.76, 91.61, 54.27, 1.48, 'oak'], ['b', 91.58, 53.88, 0.76, 91.61, 53.91, 1.48, 'oak'],
      ['b', 90.85, 53.85, 0.72, 91.45, 54.3, 0.76, 'oak'], ['b', 91.39, 54.24, 0.0, 91.42, 54.27, 0.72, 'oak'], ['b', 91.39, 53.88, 0.0, 91.42, 53.91, 0.72, 'oak'], ['b', 90.88, 54.24, 0.0, 90.91, 54.27, 0.72, 'oak'],
      ['b', 90.88, 53.88, 0.0, 90.91, 53.91, 0.72, 'oak'], ['b', 90.85, 53.85, 1.48, 91.45, 54.3, 1.52, 'oak'], ['b', 91.39, 54.24, 0.76, 91.42, 54.27, 1.48, 'oak'], ['b', 91.39, 53.88, 0.76, 91.42, 53.91, 1.48, 'oak'],
      ['b', 90.88, 54.24, 0.76, 90.91, 54.27, 1.48, 'oak'], ['b', 90.88, 53.88, 0.76, 90.91, 53.91, 1.48, 'oak'], ['b', 90.15, 53.85, 0.72, 90.75, 54.3, 0.76, 'oak'], ['b', 90.69, 54.24, 0.0, 90.72, 54.27, 0.72, 'oak'],
      ['b', 90.69, 53.88, 0.0, 90.72, 53.91, 0.72, 'oak'], ['b', 90.18, 54.24, 0.0, 90.21, 54.27, 0.72, 'oak'], ['b', 90.18, 53.88, 0.0, 90.21, 53.91, 0.72, 'oak'], ['b', 90.15, 53.85, 1.48, 90.75, 54.3, 1.52, 'oak'],
      ['b', 90.69, 54.24, 0.76, 90.72, 54.27, 1.48, 'oak'], ['b', 90.69, 53.88, 0.76, 90.72, 53.91, 1.48, 'oak'], ['b', 90.18, 54.24, 0.76, 90.21, 54.27, 1.48, 'oak'], ['b', 90.18, 53.88, 0.76, 90.21, 53.91, 1.48, 'oak'],
      ['b', 95.2, 57.1, 0.41, 95.5, 57.4, 0.45, 'wood'], ['b', 95.22, 57.12, 0, 95.25, 57.15, 0.41, 'wood'], ['b', 95.22, 57.35, 0, 95.25, 57.38, 0.41, 'wood'], ['b', 95.45, 57.12, 0, 95.48, 57.15, 0.41, 'wood'],
      ['b', 95.45, 57.35, 0, 95.48, 57.38, 0.41, 'wood'], ['b', 94.8, 57.1, 0.41, 95.1, 57.4, 0.45, 'wood'], ['b', 94.82, 57.12, 0, 94.85, 57.15, 0.41, 'wood'], ['b', 94.82, 57.35, 0, 94.85, 57.38, 0.41, 'wood'],
      ['b', 95.05, 57.12, 0, 95.08, 57.15, 0.41, 'wood'], ['b', 95.05, 57.35, 0, 95.08, 57.38, 0.41, 'wood'], ['b', 94.4, 57.1, 0.41, 94.7, 57.4, 0.45, 'wood'], ['b', 94.42, 57.12, 0, 94.45, 57.15, 0.41, 'wood'],
      ['b', 94.42, 57.35, 0, 94.45, 57.38, 0.41, 'wood'], ['b', 94.65, 57.12, 0, 94.68, 57.15, 0.41, 'wood'], ['b', 94.65, 57.35, 0, 94.68, 57.38, 0.41, 'wood'], ['b', 90.55, 57.1, 0.41, 90.85, 57.4, 0.45, 'wood'],
      ['b', 90.57, 57.12, 0, 90.6, 57.15, 0.41, 'wood'], ['b', 90.57, 57.35, 0, 90.6, 57.38, 0.41, 'wood'], ['b', 90.8, 57.12, 0, 90.83, 57.15, 0.41, 'wood'], ['b', 90.8, 57.35, 0, 90.83, 57.38, 0.41, 'wood'],
      ['b', 90.15, 57.1, 0.41, 90.45, 57.4, 0.45, 'wood'], ['b', 90.17, 57.12, 0, 90.2, 57.15, 0.41, 'wood'], ['b', 90.17, 57.35, 0, 90.2, 57.38, 0.41, 'wood'], ['b', 90.4, 57.12, 0, 90.43, 57.15, 0.41, 'wood'],
      ['b', 90.4, 57.35, 0, 90.43, 57.38, 0.41, 'wood'], ['b', 89.75, 57.1, 0.41, 90.05, 57.4, 0.45, 'wood'], ['b', 89.77, 57.12, 0, 89.8, 57.15, 0.41, 'wood'], ['b', 89.77, 57.35, 0, 89.8, 57.38, 0.41, 'wood'],
      ['b', 90.0, 57.12, 0, 90.03, 57.15, 0.41, 'wood'], ['b', 90.0, 57.35, 0, 90.03, 57.38, 0.41, 'wood'], ['b', 89.35, 57.1, 0.41, 89.65, 57.4, 0.45, 'wood'], ['b', 89.37, 57.12, 0, 89.4, 57.15, 0.41, 'wood'],
      ['b', 89.37, 57.35, 0, 89.4, 57.38, 0.41, 'wood'], ['b', 89.6, 57.12, 0, 89.63, 57.15, 0.41, 'wood'], ['b', 89.6, 57.35, 0, 89.63, 57.38, 0.41, 'wood'], ['b', 89.23, 56.75, 0, 89.29, 57.05, 1.4, 'wood'],
      ['b', 92.1, 57.35, 0, 93.0, 57.57, 0.012, 'stone']] },
    /* 3-THINGS end spare-desks-store-3-middle */
    /* 3-THINGS lamp-candle-cupboard-3 */
    /* docs/interiors/upper-floors-gaps-1028.md (lamp-candle-cupboard-3, lamp and candle cupboards): shelves along the back wall with candlesticks, oil lamps and boxes of candles, a snuffer pole on the wall; the aisle from the door stays clear */
    'lamp-candle-cupboard-3': { items: [
      ['s', 25.65, 57.15, 47.85, 57.57, [0.5, 0.9, 1.3, 1.7], 'oak'], ['y', 26.1, 57.375, 0.06, 0.5, 0.53, 'brass'], ['y', 26.1, 57.375, 0.04, 0.53, 0.62, 'glass'], ['y', 26.1, 57.375, 0.025, 0.62, 0.8, 'glass'],
      ['y', 26.1, 57.375, 0.04, 0.9, 1.15, 'brass'], ['y', 26.1, 57.375, 0.025, 1.15, 1.2, 'white'], ['b', 25.9, 57.25, 1.3, 26.3, 57.5, 1.42, 'paper'], ['y', 26.7, 57.375, 0.04, 0.5, 0.75, 'brass'],
      ['y', 26.7, 57.375, 0.025, 0.75, 0.8, 'white'], ['b', 26.5, 57.25, 0.9, 26.9, 57.5, 1.02, 'paper'], ['y', 26.7, 57.375, 0.06, 1.3, 1.33, 'brass'], ['y', 26.7, 57.375, 0.04, 1.33, 1.42, 'glass'],
      ['y', 26.7, 57.375, 0.025, 1.42, 1.6, 'glass'], ['b', 27.1, 57.25, 0.5, 27.5, 57.5, 0.62, 'paper'], ['y', 27.3, 57.375, 0.06, 0.9, 0.93, 'brass'], ['y', 27.3, 57.375, 0.04, 0.93, 1.02, 'glass'],
      ['y', 27.3, 57.375, 0.025, 1.02, 1.2, 'glass'], ['y', 27.3, 57.375, 0.04, 1.3, 1.55, 'brass'], ['y', 27.3, 57.375, 0.025, 1.55, 1.6, 'white'], ['y', 27.9, 57.375, 0.06, 0.5, 0.53, 'brass'],
      ['y', 27.9, 57.375, 0.04, 0.53, 0.62, 'glass'], ['y', 27.9, 57.375, 0.025, 0.62, 0.8, 'glass'], ['y', 27.9, 57.375, 0.04, 0.9, 1.15, 'brass'], ['y', 27.9, 57.375, 0.025, 1.15, 1.2, 'white'],
      ['b', 27.7, 57.25, 1.3, 28.1, 57.5, 1.42, 'paper'], ['y', 28.5, 57.375, 0.04, 0.5, 0.75, 'brass'], ['y', 28.5, 57.375, 0.025, 0.75, 0.8, 'white'], ['b', 28.3, 57.25, 0.9, 28.7, 57.5, 1.02, 'paper'],
      ['y', 28.5, 57.375, 0.06, 1.3, 1.33, 'brass'], ['y', 28.5, 57.375, 0.04, 1.33, 1.42, 'glass'], ['y', 28.5, 57.375, 0.025, 1.42, 1.6, 'glass'], ['b', 28.9, 57.25, 0.5, 29.3, 57.5, 0.62, 'paper'],
      ['y', 29.1, 57.375, 0.06, 0.9, 0.93, 'brass'], ['y', 29.1, 57.375, 0.04, 0.93, 1.02, 'glass'], ['y', 29.1, 57.375, 0.025, 1.02, 1.2, 'glass'], ['y', 29.1, 57.375, 0.04, 1.3, 1.55, 'brass'],
      ['y', 29.1, 57.375, 0.025, 1.55, 1.6, 'white'], ['y', 29.7, 57.375, 0.06, 0.5, 0.53, 'brass'], ['y', 29.7, 57.375, 0.04, 0.53, 0.62, 'glass'], ['y', 29.7, 57.375, 0.025, 0.62, 0.8, 'glass'],
      ['y', 29.7, 57.375, 0.04, 0.9, 1.15, 'brass'], ['y', 29.7, 57.375, 0.025, 1.15, 1.2, 'white'], ['b', 29.5, 57.25, 1.3, 29.9, 57.5, 1.42, 'paper'], ['y', 30.3, 57.375, 0.04, 0.5, 0.75, 'brass'],
      ['y', 30.3, 57.375, 0.025, 0.75, 0.8, 'white'], ['b', 30.1, 57.25, 0.9, 30.5, 57.5, 1.02, 'paper'], ['y', 30.3, 57.375, 0.06, 1.3, 1.33, 'brass'], ['y', 30.3, 57.375, 0.04, 1.33, 1.42, 'glass'],
      ['y', 30.3, 57.375, 0.025, 1.42, 1.6, 'glass'], ['b', 30.7, 57.25, 0.5, 31.1, 57.5, 0.62, 'paper'], ['y', 30.9, 57.375, 0.06, 0.9, 0.93, 'brass'], ['y', 30.9, 57.375, 0.04, 0.93, 1.02, 'glass'],
      ['y', 30.9, 57.375, 0.025, 1.02, 1.2, 'glass'], ['y', 30.9, 57.375, 0.04, 1.3, 1.55, 'brass'], ['y', 30.9, 57.375, 0.025, 1.55, 1.6, 'white'], ['y', 31.5, 57.375, 0.06, 0.5, 0.53, 'brass'],
      ['y', 31.5, 57.375, 0.04, 0.53, 0.62, 'glass'], ['y', 31.5, 57.375, 0.025, 0.62, 0.8, 'glass'], ['y', 31.5, 57.375, 0.04, 0.9, 1.15, 'brass'], ['y', 31.5, 57.375, 0.025, 1.15, 1.2, 'white'],
      ['b', 31.3, 57.25, 1.3, 31.7, 57.5, 1.42, 'paper'], ['y', 32.1, 57.375, 0.04, 0.5, 0.75, 'brass'], ['y', 32.1, 57.375, 0.025, 0.75, 0.8, 'white'], ['b', 31.9, 57.25, 0.9, 32.3, 57.5, 1.02, 'paper'],
      ['y', 32.1, 57.375, 0.06, 1.3, 1.33, 'brass'], ['y', 32.1, 57.375, 0.04, 1.33, 1.42, 'glass'], ['y', 32.1, 57.375, 0.025, 1.42, 1.6, 'glass'], ['b', 32.5, 57.25, 0.5, 32.9, 57.5, 0.62, 'paper'],
      ['y', 32.7, 57.375, 0.06, 0.9, 0.93, 'brass'], ['y', 32.7, 57.375, 0.04, 0.93, 1.02, 'glass'], ['y', 32.7, 57.375, 0.025, 1.02, 1.2, 'glass'], ['y', 32.7, 57.375, 0.04, 1.3, 1.55, 'brass'],
      ['y', 32.7, 57.375, 0.025, 1.55, 1.6, 'white'], ['y', 33.3, 57.375, 0.06, 0.5, 0.53, 'brass'], ['y', 33.3, 57.375, 0.04, 0.53, 0.62, 'glass'], ['y', 33.3, 57.375, 0.025, 0.62, 0.8, 'glass'],
      ['y', 33.3, 57.375, 0.04, 0.9, 1.15, 'brass'], ['y', 33.3, 57.375, 0.025, 1.15, 1.2, 'white'], ['b', 33.1, 57.25, 1.3, 33.5, 57.5, 1.42, 'paper'], ['y', 33.9, 57.375, 0.04, 0.5, 0.75, 'brass'],
      ['y', 33.9, 57.375, 0.025, 0.75, 0.8, 'white'], ['b', 33.7, 57.25, 0.9, 34.1, 57.5, 1.02, 'paper'], ['y', 33.9, 57.375, 0.06, 1.3, 1.33, 'brass'], ['y', 33.9, 57.375, 0.04, 1.33, 1.42, 'glass'],
      ['y', 33.9, 57.375, 0.025, 1.42, 1.6, 'glass'], ['b', 34.3, 57.25, 0.5, 34.7, 57.5, 0.62, 'paper'], ['y', 34.5, 57.375, 0.06, 0.9, 0.93, 'brass'], ['y', 34.5, 57.375, 0.04, 0.93, 1.02, 'glass'],
      ['y', 34.5, 57.375, 0.025, 1.02, 1.2, 'glass'], ['y', 34.5, 57.375, 0.04, 1.3, 1.55, 'brass'], ['y', 34.5, 57.375, 0.025, 1.55, 1.6, 'white'], ['y', 35.1, 57.375, 0.06, 0.5, 0.53, 'brass'],
      ['y', 35.1, 57.375, 0.04, 0.53, 0.62, 'glass'], ['y', 35.1, 57.375, 0.025, 0.62, 0.8, 'glass'], ['y', 35.1, 57.375, 0.04, 0.9, 1.15, 'brass'], ['y', 35.1, 57.375, 0.025, 1.15, 1.2, 'white'],
      ['b', 34.9, 57.25, 1.3, 35.3, 57.5, 1.42, 'paper'], ['y', 35.7, 57.375, 0.04, 0.5, 0.75, 'brass'], ['y', 35.7, 57.375, 0.025, 0.75, 0.8, 'white'], ['b', 35.5, 57.25, 0.9, 35.9, 57.5, 1.02, 'paper'],
      ['y', 35.7, 57.375, 0.06, 1.3, 1.33, 'brass'], ['y', 35.7, 57.375, 0.04, 1.33, 1.42, 'glass'], ['y', 35.7, 57.375, 0.025, 1.42, 1.6, 'glass'], ['b', 36.1, 57.25, 0.5, 36.5, 57.5, 0.62, 'paper'],
      ['y', 36.3, 57.375, 0.06, 0.9, 0.93, 'brass'], ['y', 36.3, 57.375, 0.04, 0.93, 1.02, 'glass'], ['y', 36.3, 57.375, 0.025, 1.02, 1.2, 'glass'], ['y', 36.3, 57.375, 0.04, 1.3, 1.55, 'brass'],
      ['y', 36.3, 57.375, 0.025, 1.55, 1.6, 'white'], ['y', 36.9, 57.375, 0.06, 0.5, 0.53, 'brass'], ['y', 36.9, 57.375, 0.04, 0.53, 0.62, 'glass'], ['y', 36.9, 57.375, 0.025, 0.62, 0.8, 'glass'],
      ['y', 36.9, 57.375, 0.04, 0.9, 1.15, 'brass'], ['y', 36.9, 57.375, 0.025, 1.15, 1.2, 'white'], ['b', 36.7, 57.25, 1.3, 37.1, 57.5, 1.42, 'paper'], ['y', 37.5, 57.375, 0.04, 0.5, 0.75, 'brass'],
      ['y', 37.5, 57.375, 0.025, 0.75, 0.8, 'white'], ['b', 37.3, 57.25, 0.9, 37.7, 57.5, 1.02, 'paper'], ['y', 37.5, 57.375, 0.06, 1.3, 1.33, 'brass'], ['y', 37.5, 57.375, 0.04, 1.33, 1.42, 'glass'],
      ['y', 37.5, 57.375, 0.025, 1.42, 1.6, 'glass'], ['b', 37.9, 57.25, 0.5, 38.3, 57.5, 0.62, 'paper'], ['y', 38.1, 57.375, 0.06, 0.9, 0.93, 'brass'], ['y', 38.1, 57.375, 0.04, 0.93, 1.02, 'glass'],
      ['y', 38.1, 57.375, 0.025, 1.02, 1.2, 'glass'], ['y', 38.1, 57.375, 0.04, 1.3, 1.55, 'brass'], ['y', 38.1, 57.375, 0.025, 1.55, 1.6, 'white'], ['y', 38.7, 57.375, 0.06, 0.5, 0.53, 'brass'],
      ['y', 38.7, 57.375, 0.04, 0.53, 0.62, 'glass'], ['y', 38.7, 57.375, 0.025, 0.62, 0.8, 'glass'], ['y', 38.7, 57.375, 0.04, 0.9, 1.15, 'brass'], ['y', 38.7, 57.375, 0.025, 1.15, 1.2, 'white'],
      ['b', 38.5, 57.25, 1.3, 38.9, 57.5, 1.42, 'paper'], ['y', 39.3, 57.375, 0.04, 0.5, 0.75, 'brass'], ['y', 39.3, 57.375, 0.025, 0.75, 0.8, 'white'], ['b', 39.1, 57.25, 0.9, 39.5, 57.5, 1.02, 'paper'],
      ['y', 39.3, 57.375, 0.06, 1.3, 1.33, 'brass'], ['y', 39.3, 57.375, 0.04, 1.33, 1.42, 'glass'], ['y', 39.3, 57.375, 0.025, 1.42, 1.6, 'glass'], ['b', 39.7, 57.25, 0.5, 40.1, 57.5, 0.62, 'paper'],
      ['y', 39.9, 57.375, 0.06, 0.9, 0.93, 'brass'], ['y', 39.9, 57.375, 0.04, 0.93, 1.02, 'glass'], ['y', 39.9, 57.375, 0.025, 1.02, 1.2, 'glass'], ['y', 39.9, 57.375, 0.04, 1.3, 1.55, 'brass'],
      ['y', 39.9, 57.375, 0.025, 1.55, 1.6, 'white'], ['y', 40.5, 57.375, 0.06, 0.5, 0.53, 'brass'], ['y', 40.5, 57.375, 0.04, 0.53, 0.62, 'glass'], ['y', 40.5, 57.375, 0.025, 0.62, 0.8, 'glass'],
      ['y', 40.5, 57.375, 0.04, 0.9, 1.15, 'brass'], ['y', 40.5, 57.375, 0.025, 1.15, 1.2, 'white'], ['b', 40.3, 57.25, 1.3, 40.7, 57.5, 1.42, 'paper'], ['y', 41.1, 57.375, 0.04, 0.5, 0.75, 'brass'],
      ['y', 41.1, 57.375, 0.025, 0.75, 0.8, 'white'], ['b', 40.9, 57.25, 0.9, 41.3, 57.5, 1.02, 'paper'], ['y', 41.1, 57.375, 0.06, 1.3, 1.33, 'brass'], ['y', 41.1, 57.375, 0.04, 1.33, 1.42, 'glass'],
      ['y', 41.1, 57.375, 0.025, 1.42, 1.6, 'glass'], ['b', 41.5, 57.25, 0.5, 41.9, 57.5, 0.62, 'paper'], ['y', 41.7, 57.375, 0.06, 0.9, 0.93, 'brass'], ['y', 41.7, 57.375, 0.04, 0.93, 1.02, 'glass'],
      ['y', 41.7, 57.375, 0.025, 1.02, 1.2, 'glass'], ['y', 41.7, 57.375, 0.04, 1.3, 1.55, 'brass'], ['y', 41.7, 57.375, 0.025, 1.55, 1.6, 'white'], ['y', 42.3, 57.375, 0.06, 0.5, 0.53, 'brass'],
      ['y', 42.3, 57.375, 0.04, 0.53, 0.62, 'glass'], ['y', 42.3, 57.375, 0.025, 0.62, 0.8, 'glass'], ['y', 42.3, 57.375, 0.04, 0.9, 1.15, 'brass'], ['y', 42.3, 57.375, 0.025, 1.15, 1.2, 'white'],
      ['b', 42.1, 57.25, 1.3, 42.5, 57.5, 1.42, 'paper'], ['y', 42.9, 57.375, 0.04, 0.5, 0.75, 'brass'], ['y', 42.9, 57.375, 0.025, 0.75, 0.8, 'white'], ['b', 42.7, 57.25, 0.9, 43.1, 57.5, 1.02, 'paper'],
      ['y', 42.9, 57.375, 0.06, 1.3, 1.33, 'brass'], ['y', 42.9, 57.375, 0.04, 1.33, 1.42, 'glass'], ['y', 42.9, 57.375, 0.025, 1.42, 1.6, 'glass'], ['b', 43.3, 57.25, 0.5, 43.7, 57.5, 0.62, 'paper'],
      ['y', 43.5, 57.375, 0.06, 0.9, 0.93, 'brass'], ['y', 43.5, 57.375, 0.04, 0.93, 1.02, 'glass'], ['y', 43.5, 57.375, 0.025, 1.02, 1.2, 'glass'], ['y', 43.5, 57.375, 0.04, 1.3, 1.55, 'brass'],
      ['y', 43.5, 57.375, 0.025, 1.55, 1.6, 'white'], ['y', 44.1, 57.375, 0.06, 0.5, 0.53, 'brass'], ['y', 44.1, 57.375, 0.04, 0.53, 0.62, 'glass'], ['y', 44.1, 57.375, 0.025, 0.62, 0.8, 'glass'],
      ['y', 44.1, 57.375, 0.04, 0.9, 1.15, 'brass'], ['y', 44.1, 57.375, 0.025, 1.15, 1.2, 'white'], ['b', 43.9, 57.25, 1.3, 44.3, 57.5, 1.42, 'paper'], ['y', 44.7, 57.375, 0.04, 0.5, 0.75, 'brass'],
      ['y', 44.7, 57.375, 0.025, 0.75, 0.8, 'white'], ['b', 44.5, 57.25, 0.9, 44.9, 57.5, 1.02, 'paper'], ['y', 44.7, 57.375, 0.06, 1.3, 1.33, 'brass'], ['y', 44.7, 57.375, 0.04, 1.33, 1.42, 'glass'],
      ['y', 44.7, 57.375, 0.025, 1.42, 1.6, 'glass'], ['b', 45.1, 57.25, 0.5, 45.5, 57.5, 0.62, 'paper'], ['y', 45.3, 57.375, 0.06, 0.9, 0.93, 'brass'], ['y', 45.3, 57.375, 0.04, 0.93, 1.02, 'glass'],
      ['y', 45.3, 57.375, 0.025, 1.02, 1.2, 'glass'], ['y', 45.3, 57.375, 0.04, 1.3, 1.55, 'brass'], ['y', 45.3, 57.375, 0.025, 1.55, 1.6, 'white'], ['y', 45.9, 57.375, 0.06, 0.5, 0.53, 'brass'],
      ['y', 45.9, 57.375, 0.04, 0.53, 0.62, 'glass'], ['y', 45.9, 57.375, 0.025, 0.62, 0.8, 'glass'], ['y', 45.9, 57.375, 0.04, 0.9, 1.15, 'brass'], ['y', 45.9, 57.375, 0.025, 1.15, 1.2, 'white'],
      ['b', 45.7, 57.25, 1.3, 46.1, 57.5, 1.42, 'paper'], ['y', 46.5, 57.375, 0.04, 0.5, 0.75, 'brass'], ['y', 46.5, 57.375, 0.025, 0.75, 0.8, 'white'], ['b', 46.3, 57.25, 0.9, 46.7, 57.5, 1.02, 'paper'],
      ['y', 46.5, 57.375, 0.06, 1.3, 1.33, 'brass'], ['y', 46.5, 57.375, 0.04, 1.33, 1.42, 'glass'], ['y', 46.5, 57.375, 0.025, 1.42, 1.6, 'glass'], ['b', 46.9, 57.25, 0.5, 47.3, 57.5, 0.62, 'paper'],
      ['y', 47.1, 57.375, 0.06, 0.9, 0.93, 'brass'], ['y', 47.1, 57.375, 0.04, 0.93, 1.02, 'glass'], ['y', 47.1, 57.375, 0.025, 1.02, 1.2, 'glass'], ['y', 47.1, 57.375, 0.04, 1.3, 1.55, 'brass'],
      ['y', 47.1, 57.375, 0.025, 1.55, 1.6, 'white'], ['b', 47.75, 57.52, 0.1, 47.78, 57.57, 2.1, 'wood'], ['b', 36.15, 54.13, 0, 37.05, 54.35, 0.012, 'stone']] },
    /* 3-THINGS end lamp-candle-cupboard-3 */
    /* 3-THINGS linen-cupboard-3-west */
    /* docs/interiors/upper-floors-gaps-1028.md (linen-cupboard-3-west, linen cupboards): a press on the back wall with folded sheets and towels, a stack of wool blankets, a sack for the wash; the aisle from the door stays clear */
    'linen-cupboard-3-west': { items: [
      ['s', 51.45, 57.05, 54.65, 57.57, [0.4, 0.8, 1.2, 1.6, 2.0], 'oak'], ['b', 51.52, 57.12, 0.4, 51.98, 57.53, 0.6, 'linen'], ['b', 51.52, 57.12, 0.8, 51.98, 57.53, 0.96, 'white'], ['b', 51.52, 57.12, 1.2, 51.98, 57.53, 1.4, 'linen'],
      ['b', 51.52, 57.12, 1.6, 51.98, 57.53, 1.72, 'white'], ['b', 52.12, 57.12, 0.4, 52.58, 57.53, 0.6, 'linen'], ['b', 52.12, 57.12, 0.8, 52.58, 57.53, 0.96, 'white'], ['b', 52.12, 57.12, 1.2, 52.58, 57.53, 1.4, 'linen'],
      ['b', 52.12, 57.12, 1.6, 52.58, 57.53, 1.72, 'white'], ['b', 52.72, 57.12, 0.4, 53.18, 57.53, 0.6, 'linen'], ['b', 52.72, 57.12, 0.8, 53.18, 57.53, 0.96, 'white'], ['b', 52.72, 57.12, 1.2, 53.18, 57.53, 1.4, 'linen'],
      ['b', 52.72, 57.12, 1.6, 53.18, 57.53, 1.72, 'white'], ['b', 53.32, 57.12, 0.4, 53.78, 57.53, 0.6, 'linen'], ['b', 53.32, 57.12, 0.8, 53.78, 57.53, 0.96, 'white'], ['b', 53.32, 57.12, 1.2, 53.78, 57.53, 1.4, 'linen'],
      ['b', 53.32, 57.12, 1.6, 53.78, 57.53, 1.72, 'white'], ['b', 53.92, 57.12, 0.4, 54.38, 57.53, 0.6, 'linen'], ['b', 53.92, 57.12, 0.8, 54.38, 57.53, 0.96, 'white'], ['b', 53.92, 57.12, 1.2, 54.38, 57.53, 1.4, 'linen'],
      ['b', 53.92, 57.12, 1.6, 54.38, 57.53, 1.72, 'white'], ['b', 54.97, 56.97, 0.0, 55.73, 57.53, 0.04, 'scarlet'], ['b', 54.97, 56.97, 0.12, 55.73, 57.53, 0.16, 'cloth'], ['b', 54.97, 56.97, 0.24, 55.73, 57.53, 0.28, 'scarlet'],
      ['y', 56.2, 57.25, 0.22, 0, 0.7, 'canvas'], ['b', 57.85, 54.13, 0, 58.75, 54.35, 0.012, 'stone']] },
    /* 3-THINGS end linen-cupboard-3-west */
    /* 3-THINGS linen-cupboard-3-east */
    /* docs/interiors/upper-floors-gaps-1028.md (linen-cupboard-3-east, linen cupboards): a press on the back wall with folded sheets and towels, a stack of wool blankets, a sack for the wash; the aisle from the door stays clear */
    'linen-cupboard-3-east': { items: [
      ['s', 156.4, 53.83, 159.6, 54.35, [0.4, 0.8, 1.2, 1.6, 2.0], 'oak'], ['b', 159.07, 53.87, 0.4, 159.53, 54.28, 0.6, 'linen'], ['b', 159.07, 53.87, 0.8, 159.53, 54.28, 0.96, 'white'], ['b', 159.07, 53.87, 1.2, 159.53, 54.28, 1.4, 'linen'],
      ['b', 159.07, 53.87, 1.6, 159.53, 54.28, 1.72, 'white'], ['b', 158.47, 53.87, 0.4, 158.93, 54.28, 0.6, 'linen'], ['b', 158.47, 53.87, 0.8, 158.93, 54.28, 0.96, 'white'], ['b', 158.47, 53.87, 1.2, 158.93, 54.28, 1.4, 'linen'],
      ['b', 158.47, 53.87, 1.6, 158.93, 54.28, 1.72, 'white'], ['b', 157.87, 53.87, 0.4, 158.33, 54.28, 0.6, 'linen'], ['b', 157.87, 53.87, 0.8, 158.33, 54.28, 0.96, 'white'], ['b', 157.87, 53.87, 1.2, 158.33, 54.28, 1.4, 'linen'],
      ['b', 157.87, 53.87, 1.6, 158.33, 54.28, 1.72, 'white'], ['b', 157.27, 53.87, 0.4, 157.73, 54.28, 0.6, 'linen'], ['b', 157.27, 53.87, 0.8, 157.73, 54.28, 0.96, 'white'], ['b', 157.27, 53.87, 1.2, 157.73, 54.28, 1.4, 'linen'],
      ['b', 157.27, 53.87, 1.6, 157.73, 54.28, 1.72, 'white'], ['b', 156.67, 53.87, 0.4, 157.13, 54.28, 0.6, 'linen'], ['b', 156.67, 53.87, 0.8, 157.13, 54.28, 0.96, 'white'], ['b', 156.67, 53.87, 1.2, 157.13, 54.28, 1.4, 'linen'],
      ['b', 156.67, 53.87, 1.6, 157.13, 54.28, 1.72, 'white'], ['b', 155.32, 53.87, 0.0, 156.08, 54.43, 0.04, 'scarlet'], ['b', 155.32, 53.87, 0.12, 156.08, 54.43, 0.16, 'cloth'], ['b', 155.32, 53.87, 0.24, 156.08, 54.43, 0.28, 'scarlet'],
      ['b', 156.925, 58.55, 0, 157.825, 58.77, 0.012, 'stone']] },
    /* 3-THINGS end linen-cupboard-3-east */
    /* 3-THINGS cleaning-cupboard-3-west */
    /* docs/interiors/upper-floors-gaps-1028.md (cleaning-cupboard-3-west, broom and cleaning cupboards): a peg rail with the rake, the mop and the brush and pan, a wooden pail and a tin bucket by them, a worn threshold; the aisle from the door stays clear */
    'cleaning-cupboard-3-west': { items: [
      ['b', -0.02, 54.25, 1.5, 0.06, 58.65, 1.56, 'oak'], ['b', -0.02, 54.55, 0, 0.04, 54.58, 1.75, 'wood'], ['b', -0.02, 54.37, 1.55, 0.05, 54.76, 1.62, 'iron'], ['b', -0.02, 55.1, 0, 0.04, 55.13, 1.6, 'wood'],
      ['b', -0.02, 55.0, 0, 0.1, 55.23, 0.3, 'rope'], ['b', -0.02, 55.65, 1.0, 0.06, 55.87, 1.5, 'wood'], ['b', -0.02, 55.69, 0.99, 0.08, 55.83, 1.0, 'steel'], ['b', -0.02, 55.65, 0.6, 0.15, 55.95, 0.62, 'tin'],
      ['y', 0.3, 56.35, 0.15, 0, 0.3, 'wood'], ['y', 0.3, 56.85, 0.16, 0, 0.32, 'tin'], ['b', 4.55, 55.85, 0, 4.77, 56.75, 0.012, 'stone']] },
    /* 3-THINGS end cleaning-cupboard-3-west */
    /* 3-THINGS cleaning-cupboard-3-lobby */
    /* docs/interiors/upper-floors-gaps-1028.md (cleaning-cupboard-3-lobby, broom and cleaning cupboards): a peg rail with the rake, the mop and the brush and pan, a wooden pail and a tin bucket by them, a worn threshold; the aisle from the door stays clear */
    'cleaning-cupboard-3-lobby': { items: [
      ['b', 71.49, 61.35, 1.5, 71.57, 71.95, 1.56, 'oak'], ['b', 71.51, 61.65, 0, 71.57, 61.68, 1.75, 'wood'], ['b', 71.5, 61.47, 1.55, 71.57, 61.86, 1.62, 'iron'], ['b', 71.51, 62.2, 0, 71.57, 62.23, 1.6, 'wood'],
      ['b', 71.45, 62.1, 0, 71.57, 62.33, 0.3, 'rope'], ['b', 71.49, 62.75, 1.0, 71.57, 62.97, 1.5, 'wood'], ['b', 71.47, 62.79, 0.99, 71.57, 62.93, 1.0, 'steel'], ['b', 71.4, 62.75, 0.6, 71.57, 63.05, 0.62, 'tin'],
      ['y', 71.25, 63.45, 0.15, 0, 0.3, 'wood'], ['y', 71.25, 63.95, 0.16, 0, 0.32, 'tin'], ['b', 69.65, 59.63, 0, 70.55, 59.85, 0.012, 'stone']] },
    /* 3-THINGS end cleaning-cupboard-3-lobby */
    /* 3-THINGS broom-cupboard-3-middle */
    /* docs/interiors/upper-floors-gaps-1028.md (broom-cupboard-3-middle, broom and cleaning cupboards): a peg rail with the rake, the mop and the brush and pan, a wooden pail and a tin bucket by them, a worn threshold; the aisle from the door stays clear */
    'broom-cupboard-3-middle': { items: [
      ['b', 72.35, 53.83, 1.5, 86.45, 53.91, 1.56, 'oak'], ['b', 86.12, 53.83, 0, 86.15, 53.89, 1.75, 'wood'], ['b', 85.94, 53.83, 1.55, 86.33, 53.9, 1.62, 'iron'], ['b', 85.57, 53.83, 0, 85.6, 53.89, 1.6, 'wood'],
      ['b', 85.47, 53.83, 0, 85.7, 53.95, 0.3, 'rope'], ['b', 84.83, 53.83, 1.0, 85.05, 53.91, 1.5, 'wood'], ['b', 84.87, 53.83, 0.99, 85.01, 53.93, 1.0, 'steel'], ['b', 84.75, 53.83, 0.6, 85.05, 54.0, 0.62, 'tin'],
      ['y', 84.35, 54.15, 0.15, 0, 0.3, 'wood'], ['y', 83.85, 54.15, 0.16, 0, 0.32, 'tin'], ['b', 79.1, 57.35, 0, 80.0, 57.57, 0.012, 'stone']] },
    /* 3-THINGS end broom-cupboard-3-middle */
    /* 3-THINGS broom-cupboard-3-east */
    /* docs/interiors/upper-floors-gaps-1028.md (broom-cupboard-3-east, broom and cleaning cupboards): a peg rail with the rake, the mop and the brush and pan, a wooden pail and a tin bucket by them, a worn threshold; the aisle from the door stays clear */
    'broom-cupboard-3-east': { items: [
      ['b', 143.69, 53.95, 1.5, 143.77, 58.35, 1.56, 'oak'], ['b', 143.71, 58.02, 0, 143.77, 58.05, 1.75, 'wood'], ['b', 143.7, 57.84, 1.55, 143.77, 58.23, 1.62, 'iron'], ['b', 143.71, 57.47, 0, 143.77, 57.5, 1.6, 'wood'],
      ['b', 143.65, 57.37, 0, 143.77, 57.6, 0.3, 'rope'], ['b', 143.69, 56.73, 1.0, 143.77, 56.95, 1.5, 'wood'], ['b', 143.67, 56.77, 0.99, 143.77, 56.91, 1.0, 'steel'], ['b', 143.6, 56.65, 0.6, 143.77, 56.95, 0.62, 'tin'],
      ['y', 143.45, 56.25, 0.15, 0, 0.3, 'wood'], ['y', 143.45, 55.75, 0.16, 0, 0.32, 'tin'], ['b', 139.43, 55.85, 0, 139.65, 56.75, 0.012, 'stone']] },
    /* 3-THINGS end broom-cupboard-3-east */
    /* 3-THINGS charms-preparation-room-3 */
    /* docs/interiors/upper-floors-gaps-1028.md (charms-preparation-room-3, -): a bookcase of spell books on the south wall, the worktable beside it with open and shut books, a lamp and a teapot, a stool, a shelf of nine teacups on saucers on the north wall; both doors' sweeps kept clear */
    'charms-preparation-room-3': { items: [
      ['s', 121.0, 73.05, 124.6, 73.42, [0.1, 0.5, 0.9, 1.3000000000000003, 1.7000000000000002, 2.1], 'oak'], ['b', 121.06, 73.09, 0.11, 121.26, 73.34, 0.41, 'leather'], ['b', 121.28, 73.09, 0.11, 121.51, 73.34, 0.43, 'dark'], ['b', 121.53, 73.09, 0.11, 121.79, 73.34, 0.45, 'scarlet'],
      ['b', 121.81, 73.09, 0.11, 122.01, 73.34, 0.47, 'blue'], ['b', 122.03, 73.09, 0.11, 122.26, 73.34, 0.41, 'green'], ['b', 122.28, 73.09, 0.11, 122.54, 73.34, 0.43, 'leather'], ['b', 122.56, 73.09, 0.11, 122.76, 73.34, 0.45, 'dark'],
      ['b', 122.78, 73.09, 0.11, 123.01, 73.34, 0.47, 'scarlet'], ['b', 123.03, 73.09, 0.11, 123.29, 73.34, 0.41, 'blue'], ['b', 123.31, 73.09, 0.11, 123.51, 73.34, 0.43, 'green'], ['b', 123.53, 73.09, 0.11, 123.76, 73.34, 0.45, 'leather'],
      ['b', 123.78, 73.09, 0.11, 124.04, 73.34, 0.47, 'dark'], ['b', 124.06, 73.09, 0.11, 124.26, 73.34, 0.41, 'scarlet'], ['b', 124.28, 73.09, 0.11, 124.51, 73.34, 0.43, 'blue'], ['b', 121.06, 73.09, 0.51, 121.29, 73.34, 0.87, 'dark'],
      ['b', 121.31, 73.09, 0.51, 121.57, 73.34, 0.81, 'scarlet'], ['b', 121.59, 73.09, 0.51, 121.79, 73.34, 0.83, 'blue'], ['b', 121.81, 73.09, 0.51, 122.04, 73.34, 0.85, 'green'], ['b', 122.06, 73.09, 0.51, 122.32, 73.34, 0.87, 'leather'],
      ['b', 122.34, 73.09, 0.51, 122.54, 73.34, 0.81, 'dark'], ['b', 122.56, 73.09, 0.51, 122.79, 73.34, 0.83, 'scarlet'], ['b', 122.81, 73.09, 0.51, 123.07, 73.34, 0.85, 'blue'], ['b', 123.09, 73.09, 0.51, 123.29, 73.34, 0.87, 'green'],
      ['b', 123.31, 73.09, 0.51, 123.54, 73.34, 0.81, 'leather'], ['b', 123.56, 73.09, 0.51, 123.82, 73.34, 0.83, 'dark'], ['b', 123.84, 73.09, 0.51, 124.04, 73.34, 0.85, 'scarlet'], ['b', 124.06, 73.09, 0.51, 124.29, 73.34, 0.87, 'blue'],
      ['b', 124.31, 73.09, 0.51, 124.57, 73.34, 0.81, 'green'], ['b', 121.06, 73.09, 0.91, 121.32, 73.34, 1.25, 'scarlet'], ['b', 121.34, 73.09, 0.91, 121.54, 73.34, 1.27, 'blue'], ['b', 121.56, 73.09, 0.91, 121.79, 73.34, 1.21, 'green'],
      ['b', 121.81, 73.09, 0.91, 122.07, 73.34, 1.23, 'leather'], ['b', 122.09, 73.09, 0.91, 122.29, 73.34, 1.25, 'dark'], ['b', 122.31, 73.09, 0.91, 122.54, 73.34, 1.27, 'scarlet'], ['b', 122.56, 73.09, 0.91, 122.82, 73.34, 1.21, 'blue'],
      ['b', 122.84, 73.09, 0.91, 123.04, 73.34, 1.23, 'green'], ['b', 123.06, 73.09, 0.91, 123.29, 73.34, 1.25, 'leather'], ['b', 123.31, 73.09, 0.91, 123.57, 73.34, 1.27, 'dark'], ['b', 123.59, 73.09, 0.91, 123.79, 73.34, 1.21, 'scarlet'],
      ['b', 123.81, 73.09, 0.91, 124.04, 73.34, 1.23, 'blue'], ['b', 124.06, 73.09, 0.91, 124.32, 73.34, 1.25, 'green'], ['b', 124.34, 73.09, 0.91, 124.54, 73.34, 1.27, 'leather'], ['b', 121.06, 73.09, 1.31, 121.26, 73.34, 1.63, 'blue'],
      ['b', 121.28, 73.09, 1.31, 121.51, 73.34, 1.65, 'green'], ['b', 121.53, 73.09, 1.31, 121.79, 73.34, 1.67, 'leather'], ['b', 121.81, 73.09, 1.31, 122.01, 73.34, 1.61, 'dark'], ['b', 122.03, 73.09, 1.31, 122.26, 73.34, 1.63, 'scarlet'],
      ['b', 122.28, 73.09, 1.31, 122.54, 73.34, 1.65, 'blue'], ['b', 122.56, 73.09, 1.31, 122.76, 73.34, 1.67, 'green'], ['b', 122.78, 73.09, 1.31, 123.01, 73.34, 1.61, 'leather'], ['b', 123.03, 73.09, 1.31, 123.29, 73.34, 1.63, 'dark'],
      ['b', 123.31, 73.09, 1.31, 123.51, 73.34, 1.65, 'scarlet'], ['b', 123.53, 73.09, 1.31, 123.76, 73.34, 1.67, 'blue'], ['b', 123.78, 73.09, 1.31, 124.04, 73.34, 1.61, 'green'], ['b', 124.06, 73.09, 1.31, 124.26, 73.34, 1.63, 'leather'],
      ['b', 124.28, 73.09, 1.31, 124.51, 73.34, 1.65, 'dark'], ['b', 121.06, 73.09, 1.71, 121.29, 73.34, 2.01, 'green'], ['b', 121.31, 73.09, 1.71, 121.57, 73.34, 2.03, 'leather'], ['b', 121.59, 73.09, 1.71, 121.79, 73.34, 2.05, 'dark'],
      ['b', 121.81, 73.09, 1.71, 122.04, 73.34, 2.07, 'scarlet'], ['b', 122.06, 73.09, 1.71, 122.32, 73.34, 2.01, 'blue'], ['b', 122.34, 73.09, 1.71, 122.54, 73.34, 2.03, 'green'], ['b', 122.56, 73.09, 1.71, 122.79, 73.34, 2.05, 'leather'],
      ['b', 122.81, 73.09, 1.71, 123.07, 73.34, 2.07, 'dark'], ['b', 123.09, 73.09, 1.71, 123.29, 73.34, 2.01, 'scarlet'], ['b', 123.31, 73.09, 1.71, 123.54, 73.34, 2.03, 'blue'], ['b', 123.56, 73.09, 1.71, 123.82, 73.34, 2.05, 'green'],
      ['b', 123.84, 73.09, 1.71, 124.04, 73.34, 2.07, 'leather'], ['b', 124.06, 73.09, 1.71, 124.29, 73.34, 2.01, 'dark'], ['b', 124.31, 73.09, 1.71, 124.57, 73.34, 2.03, 'scarlet'], ['t', 125.6, 72.6, 130.2, 73.37, 0.85, 'oak'],
      ['b', 125.7, 72.7, 0.85, 126.2, 73.2, 0.91, 'dark'], ['b', 125.75, 72.75, 0.91, 126.15, 73.15, 0.915, 'paper'], ['b', 126.6, 72.8, 0.85, 126.9, 73.15, 0.88, 'leather'], ['b', 126.65, 72.85, 0.88, 126.85, 73.1, 0.9, 'paper'],
      ['y', 129.9, 72.95, 0.06, 0.85, 0.88, 'brass'], ['y', 129.9, 72.95, 0.04, 0.88, 0.97, 'glass'], ['y', 129.9, 72.95, 0.025, 0.97, 1.15, 'glass'], ['y', 127.8, 73.0, 0.05, 0.85, 0.95, 'white'],
      ['y', 127.8, 73.0, 0.08, 0.85, 0.87, 'white'], ['b', 126.65, 72.0, 0.41, 126.95, 72.3, 0.45, 'wood'], ['b', 126.67, 72.02, 0, 126.7, 72.05, 0.41, 'wood'], ['b', 126.67, 72.25, 0, 126.7, 72.28, 0.41, 'wood'],
      ['b', 126.9, 72.02, 0, 126.93, 72.05, 0.41, 'wood'], ['b', 126.9, 72.25, 0, 126.93, 72.28, 0.41, 'wood'], ['b', 131.0, 70.28, 1.38, 135.0, 70.5, 1.42, 'pine'], ['y', 131.25, 70.42, 0.07, 1.42, 1.43, 'white'],
      ['y', 131.25, 70.42, 0.04, 1.43, 1.5, 'white'], ['y', 131.65, 70.42, 0.07, 1.42, 1.43, 'white'], ['y', 131.65, 70.42, 0.04, 1.43, 1.5, 'white'], ['y', 132.05, 70.42, 0.07, 1.42, 1.43, 'white'],
      ['y', 132.05, 70.42, 0.04, 1.43, 1.5, 'white'], ['y', 132.45, 70.42, 0.07, 1.42, 1.43, 'white'], ['y', 132.45, 70.42, 0.04, 1.43, 1.5, 'white'], ['y', 132.85, 70.42, 0.07, 1.42, 1.43, 'white'],
      ['y', 132.85, 70.42, 0.04, 1.43, 1.5, 'white'], ['y', 133.25, 70.42, 0.07, 1.42, 1.43, 'white'], ['y', 133.25, 70.42, 0.04, 1.43, 1.5, 'white'], ['y', 133.65, 70.42, 0.07, 1.42, 1.43, 'white'],
      ['y', 133.65, 70.42, 0.04, 1.43, 1.5, 'white'], ['y', 134.05, 70.42, 0.07, 1.42, 1.43, 'white'], ['y', 134.05, 70.42, 0.04, 1.43, 1.5, 'white'], ['y', 134.45, 70.42, 0.07, 1.42, 1.43, 'white'],
      ['y', 134.45, 70.42, 0.04, 1.43, 1.5, 'white']] },
    /* 3-THINGS end charms-preparation-room-3 */
    /* 3-THINGS charms-store-3 */
    /* docs/interiors/upper-floors-gaps-1028.md (charms-store-3, x): a wall of shelves 2.0 high on the west wall with earthenware dishes and tall glasses; two crates of squab cushions and a loose pile on the east side; the pineapple crate stands as a plain placeholder with a straw bed and no fruit (Objects' gap, req 1838); the aisle from the door stays clear */
    'charms-store-3': { items: [
      ['s', 112.83, 62.2, 113.25, 71.6, [0.1, 0.6, 1.1, 1.6, 2.0], 'pine'], ['y', 113.05, 62.44, 0.14, 0.11, 0.15, 'white'], ['y', 113.05, 62.44, 0.09, 0.11, 0.14, 'deal'], ['y', 113.05, 62.74, 0.14, 0.11, 0.15, 'white'],
      ['y', 113.05, 62.74, 0.09, 0.11, 0.14, 'deal'], ['y', 113.05, 63.0, 0.06, 0.11, 0.4, 'glass'], ['y', 113.05, 63.24, 0.14, 0.11, 0.15, 'white'], ['y', 113.05, 63.24, 0.09, 0.11, 0.14, 'deal'],
      ['y', 113.05, 63.54, 0.14, 0.11, 0.15, 'white'], ['y', 113.05, 63.54, 0.09, 0.11, 0.14, 'deal'], ['y', 113.05, 63.8, 0.06, 0.11, 0.4, 'glass'], ['y', 113.05, 64.04, 0.14, 0.11, 0.15, 'white'],
      ['y', 113.05, 64.04, 0.09, 0.11, 0.14, 'deal'], ['y', 113.05, 64.34, 0.14, 0.11, 0.15, 'white'], ['y', 113.05, 64.34, 0.09, 0.11, 0.14, 'deal'], ['y', 113.05, 64.6, 0.06, 0.11, 0.4, 'glass'],
      ['y', 113.05, 64.84, 0.14, 0.11, 0.15, 'white'], ['y', 113.05, 64.84, 0.09, 0.11, 0.14, 'deal'], ['y', 113.05, 65.14, 0.14, 0.11, 0.15, 'white'], ['y', 113.05, 65.14, 0.09, 0.11, 0.14, 'deal'],
      ['y', 113.05, 65.4, 0.06, 0.11, 0.4, 'glass'], ['y', 113.05, 65.64, 0.14, 0.11, 0.15, 'white'], ['y', 113.05, 65.64, 0.09, 0.11, 0.14, 'deal'], ['y', 113.05, 65.94, 0.14, 0.11, 0.15, 'white'],
      ['y', 113.05, 65.94, 0.09, 0.11, 0.14, 'deal'], ['y', 113.05, 66.2, 0.06, 0.11, 0.4, 'glass'], ['y', 113.05, 66.44, 0.14, 0.11, 0.15, 'white'], ['y', 113.05, 66.44, 0.09, 0.11, 0.14, 'deal'],
      ['y', 113.05, 66.74, 0.14, 0.11, 0.15, 'white'], ['y', 113.05, 66.74, 0.09, 0.11, 0.14, 'deal'], ['y', 113.05, 67.0, 0.06, 0.11, 0.4, 'glass'], ['y', 113.05, 67.24, 0.14, 0.11, 0.15, 'white'],
      ['y', 113.05, 67.24, 0.09, 0.11, 0.14, 'deal'], ['y', 113.05, 67.54, 0.14, 0.11, 0.15, 'white'], ['y', 113.05, 67.54, 0.09, 0.11, 0.14, 'deal'], ['y', 113.05, 67.8, 0.06, 0.11, 0.4, 'glass'],
      ['y', 113.05, 68.04, 0.14, 0.11, 0.15, 'white'], ['y', 113.05, 68.04, 0.09, 0.11, 0.14, 'deal'], ['y', 113.05, 68.34, 0.14, 0.11, 0.15, 'white'], ['y', 113.05, 68.34, 0.09, 0.11, 0.14, 'deal'],
      ['y', 113.05, 68.6, 0.06, 0.11, 0.4, 'glass'], ['y', 113.05, 68.84, 0.14, 0.11, 0.15, 'white'], ['y', 113.05, 68.84, 0.09, 0.11, 0.14, 'deal'], ['y', 113.05, 69.14, 0.14, 0.11, 0.15, 'white'],
      ['y', 113.05, 69.14, 0.09, 0.11, 0.14, 'deal'], ['y', 113.05, 69.4, 0.06, 0.11, 0.4, 'glass'], ['y', 113.05, 69.64, 0.14, 0.11, 0.15, 'white'], ['y', 113.05, 69.64, 0.09, 0.11, 0.14, 'deal'],
      ['y', 113.05, 69.94, 0.14, 0.11, 0.15, 'white'], ['y', 113.05, 69.94, 0.09, 0.11, 0.14, 'deal'], ['y', 113.05, 70.2, 0.06, 0.11, 0.4, 'glass'], ['y', 113.05, 70.44, 0.14, 0.11, 0.15, 'white'],
      ['y', 113.05, 70.44, 0.09, 0.11, 0.14, 'deal'], ['y', 113.05, 70.74, 0.14, 0.11, 0.15, 'white'], ['y', 113.05, 70.74, 0.09, 0.11, 0.14, 'deal'], ['y', 113.05, 71.0, 0.06, 0.11, 0.4, 'glass'],
      ['y', 113.05, 71.24, 0.14, 0.11, 0.15, 'white'], ['y', 113.05, 71.24, 0.09, 0.11, 0.14, 'deal'], ['y', 113.05, 62.44, 0.14, 0.61, 0.65, 'white'], ['y', 113.05, 62.44, 0.09, 0.61, 0.64, 'deal'],
      ['y', 113.05, 62.7, 0.06, 0.61, 0.9, 'glass'], ['y', 113.05, 62.94, 0.14, 0.61, 0.65, 'white'], ['y', 113.05, 62.94, 0.09, 0.61, 0.64, 'deal'], ['y', 113.05, 63.24, 0.14, 0.61, 0.65, 'white'],
      ['y', 113.05, 63.24, 0.09, 0.61, 0.64, 'deal'], ['y', 113.05, 63.5, 0.06, 0.61, 0.9, 'glass'], ['y', 113.05, 63.74, 0.14, 0.61, 0.65, 'white'], ['y', 113.05, 63.74, 0.09, 0.61, 0.64, 'deal'],
      ['y', 113.05, 64.04, 0.14, 0.61, 0.65, 'white'], ['y', 113.05, 64.04, 0.09, 0.61, 0.64, 'deal'], ['y', 113.05, 64.3, 0.06, 0.61, 0.9, 'glass'], ['y', 113.05, 64.54, 0.14, 0.61, 0.65, 'white'],
      ['y', 113.05, 64.54, 0.09, 0.61, 0.64, 'deal'], ['y', 113.05, 64.84, 0.14, 0.61, 0.65, 'white'], ['y', 113.05, 64.84, 0.09, 0.61, 0.64, 'deal'], ['y', 113.05, 65.1, 0.06, 0.61, 0.9, 'glass'],
      ['y', 113.05, 65.34, 0.14, 0.61, 0.65, 'white'], ['y', 113.05, 65.34, 0.09, 0.61, 0.64, 'deal'], ['y', 113.05, 65.64, 0.14, 0.61, 0.65, 'white'], ['y', 113.05, 65.64, 0.09, 0.61, 0.64, 'deal'],
      ['y', 113.05, 65.9, 0.06, 0.61, 0.9, 'glass'], ['y', 113.05, 66.14, 0.14, 0.61, 0.65, 'white'], ['y', 113.05, 66.14, 0.09, 0.61, 0.64, 'deal'], ['y', 113.05, 66.44, 0.14, 0.61, 0.65, 'white'],
      ['y', 113.05, 66.44, 0.09, 0.61, 0.64, 'deal'], ['y', 113.05, 66.7, 0.06, 0.61, 0.9, 'glass'], ['y', 113.05, 66.94, 0.14, 0.61, 0.65, 'white'], ['y', 113.05, 66.94, 0.09, 0.61, 0.64, 'deal'],
      ['y', 113.05, 67.24, 0.14, 0.61, 0.65, 'white'], ['y', 113.05, 67.24, 0.09, 0.61, 0.64, 'deal'], ['y', 113.05, 67.5, 0.06, 0.61, 0.9, 'glass'], ['y', 113.05, 67.74, 0.14, 0.61, 0.65, 'white'],
      ['y', 113.05, 67.74, 0.09, 0.61, 0.64, 'deal'], ['y', 113.05, 68.04, 0.14, 0.61, 0.65, 'white'], ['y', 113.05, 68.04, 0.09, 0.61, 0.64, 'deal'], ['y', 113.05, 68.3, 0.06, 0.61, 0.9, 'glass'],
      ['y', 113.05, 68.54, 0.14, 0.61, 0.65, 'white'], ['y', 113.05, 68.54, 0.09, 0.61, 0.64, 'deal'], ['y', 113.05, 68.84, 0.14, 0.61, 0.65, 'white'], ['y', 113.05, 68.84, 0.09, 0.61, 0.64, 'deal'],
      ['y', 113.05, 69.1, 0.06, 0.61, 0.9, 'glass'], ['y', 113.05, 69.34, 0.14, 0.61, 0.65, 'white'], ['y', 113.05, 69.34, 0.09, 0.61, 0.64, 'deal'], ['y', 113.05, 69.64, 0.14, 0.61, 0.65, 'white'],
      ['y', 113.05, 69.64, 0.09, 0.61, 0.64, 'deal'], ['y', 113.05, 69.9, 0.06, 0.61, 0.9, 'glass'], ['y', 113.05, 70.14, 0.14, 0.61, 0.65, 'white'], ['y', 113.05, 70.14, 0.09, 0.61, 0.64, 'deal'],
      ['y', 113.05, 70.44, 0.14, 0.61, 0.65, 'white'], ['y', 113.05, 70.44, 0.09, 0.61, 0.64, 'deal'], ['y', 113.05, 70.7, 0.06, 0.61, 0.9, 'glass'], ['y', 113.05, 70.94, 0.14, 0.61, 0.65, 'white'],
      ['y', 113.05, 70.94, 0.09, 0.61, 0.64, 'deal'], ['y', 113.05, 71.24, 0.14, 0.61, 0.65, 'white'], ['y', 113.05, 71.24, 0.09, 0.61, 0.64, 'deal'], ['y', 113.05, 62.4, 0.06, 1.11, 1.4, 'glass'],
      ['y', 113.05, 62.64, 0.14, 1.11, 1.15, 'white'], ['y', 113.05, 62.64, 0.09, 1.11, 1.14, 'deal'], ['y', 113.05, 62.94, 0.14, 1.11, 1.15, 'white'], ['y', 113.05, 62.94, 0.09, 1.11, 1.14, 'deal'],
      ['y', 113.05, 63.2, 0.06, 1.11, 1.4, 'glass'], ['y', 113.05, 63.44, 0.14, 1.11, 1.15, 'white'], ['y', 113.05, 63.44, 0.09, 1.11, 1.14, 'deal'], ['y', 113.05, 63.74, 0.14, 1.11, 1.15, 'white'],
      ['y', 113.05, 63.74, 0.09, 1.11, 1.14, 'deal'], ['y', 113.05, 64.0, 0.06, 1.11, 1.4, 'glass'], ['y', 113.05, 64.24, 0.14, 1.11, 1.15, 'white'], ['y', 113.05, 64.24, 0.09, 1.11, 1.14, 'deal'],
      ['y', 113.05, 64.54, 0.14, 1.11, 1.15, 'white'], ['y', 113.05, 64.54, 0.09, 1.11, 1.14, 'deal'], ['y', 113.05, 64.8, 0.06, 1.11, 1.4, 'glass'], ['y', 113.05, 65.04, 0.14, 1.11, 1.15, 'white'],
      ['y', 113.05, 65.04, 0.09, 1.11, 1.14, 'deal'], ['y', 113.05, 65.34, 0.14, 1.11, 1.15, 'white'], ['y', 113.05, 65.34, 0.09, 1.11, 1.14, 'deal'], ['y', 113.05, 65.6, 0.06, 1.11, 1.4, 'glass'],
      ['y', 113.05, 65.84, 0.14, 1.11, 1.15, 'white'], ['y', 113.05, 65.84, 0.09, 1.11, 1.14, 'deal'], ['y', 113.05, 66.14, 0.14, 1.11, 1.15, 'white'], ['y', 113.05, 66.14, 0.09, 1.11, 1.14, 'deal'],
      ['y', 113.05, 66.4, 0.06, 1.11, 1.4, 'glass'], ['y', 113.05, 66.64, 0.14, 1.11, 1.15, 'white'], ['y', 113.05, 66.64, 0.09, 1.11, 1.14, 'deal'], ['y', 113.05, 66.94, 0.14, 1.11, 1.15, 'white'],
      ['y', 113.05, 66.94, 0.09, 1.11, 1.14, 'deal'], ['y', 113.05, 67.2, 0.06, 1.11, 1.4, 'glass'], ['y', 113.05, 67.44, 0.14, 1.11, 1.15, 'white'], ['y', 113.05, 67.44, 0.09, 1.11, 1.14, 'deal'],
      ['y', 113.05, 67.74, 0.14, 1.11, 1.15, 'white'], ['y', 113.05, 67.74, 0.09, 1.11, 1.14, 'deal'], ['y', 113.05, 68.0, 0.06, 1.11, 1.4, 'glass'], ['y', 113.05, 68.24, 0.14, 1.11, 1.15, 'white'],
      ['y', 113.05, 68.24, 0.09, 1.11, 1.14, 'deal'], ['y', 113.05, 68.54, 0.14, 1.11, 1.15, 'white'], ['y', 113.05, 68.54, 0.09, 1.11, 1.14, 'deal'], ['y', 113.05, 68.8, 0.06, 1.11, 1.4, 'glass'],
      ['y', 113.05, 69.04, 0.14, 1.11, 1.15, 'white'], ['y', 113.05, 69.04, 0.09, 1.11, 1.14, 'deal'], ['y', 113.05, 69.34, 0.14, 1.11, 1.15, 'white'], ['y', 113.05, 69.34, 0.09, 1.11, 1.14, 'deal'],
      ['y', 113.05, 69.6, 0.06, 1.11, 1.4, 'glass'], ['y', 113.05, 69.84, 0.14, 1.11, 1.15, 'white'], ['y', 113.05, 69.84, 0.09, 1.11, 1.14, 'deal'], ['y', 113.05, 70.14, 0.14, 1.11, 1.15, 'white'],
      ['y', 113.05, 70.14, 0.09, 1.11, 1.14, 'deal'], ['y', 113.05, 70.4, 0.06, 1.11, 1.4, 'glass'], ['y', 113.05, 70.64, 0.14, 1.11, 1.15, 'white'], ['y', 113.05, 70.64, 0.09, 1.11, 1.14, 'deal'],
      ['y', 113.05, 70.94, 0.14, 1.11, 1.15, 'white'], ['y', 113.05, 70.94, 0.09, 1.11, 1.14, 'deal'], ['y', 113.05, 71.2, 0.06, 1.11, 1.4, 'glass'], ['y', 113.05, 62.44, 0.14, 1.61, 1.65, 'white'],
      ['y', 113.05, 62.44, 0.09, 1.61, 1.64, 'deal'], ['y', 113.05, 62.74, 0.14, 1.61, 1.65, 'white'], ['y', 113.05, 62.74, 0.09, 1.61, 1.64, 'deal'], ['y', 113.05, 63.0, 0.06, 1.61, 1.9, 'glass'],
      ['y', 113.05, 63.24, 0.14, 1.61, 1.65, 'white'], ['y', 113.05, 63.24, 0.09, 1.61, 1.64, 'deal'], ['y', 113.05, 63.54, 0.14, 1.61, 1.65, 'white'], ['y', 113.05, 63.54, 0.09, 1.61, 1.64, 'deal'],
      ['y', 113.05, 63.8, 0.06, 1.61, 1.9, 'glass'], ['y', 113.05, 64.04, 0.14, 1.61, 1.65, 'white'], ['y', 113.05, 64.04, 0.09, 1.61, 1.64, 'deal'], ['y', 113.05, 64.34, 0.14, 1.61, 1.65, 'white'],
      ['y', 113.05, 64.34, 0.09, 1.61, 1.64, 'deal'], ['y', 113.05, 64.6, 0.06, 1.61, 1.9, 'glass'], ['y', 113.05, 64.84, 0.14, 1.61, 1.65, 'white'], ['y', 113.05, 64.84, 0.09, 1.61, 1.64, 'deal'],
      ['y', 113.05, 65.14, 0.14, 1.61, 1.65, 'white'], ['y', 113.05, 65.14, 0.09, 1.61, 1.64, 'deal'], ['y', 113.05, 65.4, 0.06, 1.61, 1.9, 'glass'], ['y', 113.05, 65.64, 0.14, 1.61, 1.65, 'white'],
      ['y', 113.05, 65.64, 0.09, 1.61, 1.64, 'deal'], ['y', 113.05, 65.94, 0.14, 1.61, 1.65, 'white'], ['y', 113.05, 65.94, 0.09, 1.61, 1.64, 'deal'], ['y', 113.05, 66.2, 0.06, 1.61, 1.9, 'glass'],
      ['y', 113.05, 66.44, 0.14, 1.61, 1.65, 'white'], ['y', 113.05, 66.44, 0.09, 1.61, 1.64, 'deal'], ['y', 113.05, 66.74, 0.14, 1.61, 1.65, 'white'], ['y', 113.05, 66.74, 0.09, 1.61, 1.64, 'deal'],
      ['y', 113.05, 67.0, 0.06, 1.61, 1.9, 'glass'], ['y', 113.05, 67.24, 0.14, 1.61, 1.65, 'white'], ['y', 113.05, 67.24, 0.09, 1.61, 1.64, 'deal'], ['y', 113.05, 67.54, 0.14, 1.61, 1.65, 'white'],
      ['y', 113.05, 67.54, 0.09, 1.61, 1.64, 'deal'], ['y', 113.05, 67.8, 0.06, 1.61, 1.9, 'glass'], ['y', 113.05, 68.04, 0.14, 1.61, 1.65, 'white'], ['y', 113.05, 68.04, 0.09, 1.61, 1.64, 'deal'],
      ['y', 113.05, 68.34, 0.14, 1.61, 1.65, 'white'], ['y', 113.05, 68.34, 0.09, 1.61, 1.64, 'deal'], ['y', 113.05, 68.6, 0.06, 1.61, 1.9, 'glass'], ['y', 113.05, 68.84, 0.14, 1.61, 1.65, 'white'],
      ['y', 113.05, 68.84, 0.09, 1.61, 1.64, 'deal'], ['y', 113.05, 69.14, 0.14, 1.61, 1.65, 'white'], ['y', 113.05, 69.14, 0.09, 1.61, 1.64, 'deal'], ['y', 113.05, 69.4, 0.06, 1.61, 1.9, 'glass'],
      ['y', 113.05, 69.64, 0.14, 1.61, 1.65, 'white'], ['y', 113.05, 69.64, 0.09, 1.61, 1.64, 'deal'], ['y', 113.05, 69.94, 0.14, 1.61, 1.65, 'white'], ['y', 113.05, 69.94, 0.09, 1.61, 1.64, 'deal'],
      ['y', 113.05, 70.2, 0.06, 1.61, 1.9, 'glass'], ['y', 113.05, 70.44, 0.14, 1.61, 1.65, 'white'], ['y', 113.05, 70.44, 0.09, 1.61, 1.64, 'deal'], ['y', 113.05, 70.74, 0.14, 1.61, 1.65, 'white'],
      ['y', 113.05, 70.74, 0.09, 1.61, 1.64, 'deal'], ['y', 113.05, 71.0, 0.06, 1.61, 1.9, 'glass'], ['y', 113.05, 71.24, 0.14, 1.61, 1.65, 'white'], ['y', 113.05, 71.24, 0.09, 1.61, 1.64, 'deal'],
      ['b', 118.65, 63.0, 0, 119.72, 64.6, 0.5, 'deal'], ['b', 118.69, 63.04, 0.5, 119.68, 64.56, 0.54, 'deal'], ['b', 118.73, 63.1, 0.54, 119.64, 64.5, 0.64, 'scarlet'], ['b', 118.73, 63.1, 0.64, 119.64, 64.5, 0.74, 'blue'],
      ['b', 118.73, 63.1, 0.74, 119.64, 64.5, 0.84, 'green'], ['b', 118.65, 65.1, 0, 119.72, 66.7, 0.5, 'deal'], ['b', 118.73, 65.2, 0.5, 119.64, 66.6, 0.6, 'blue'], ['b', 118.73, 65.2, 0.6, 119.64, 66.6, 0.7, 'scarlet'],
      ['b', 118.8, 68.0, 0.0, 119.7, 68.9, 0.12, 'green'], ['b', 118.83, 68.02, 0.12, 119.68, 68.9, 0.24, 'scarlet'], ['b', 118.86, 68.04, 0.24, 119.66, 68.9, 0.36, 'blue'], ['b', 118.75, 70.0, 0, 119.72, 71.0, 0.45, 'deal'],
      ['b', 118.79, 70.04, 0.45, 119.68, 70.96, 0.5, 'straw']] },
    /* 3-THINGS end charms-store-3 */
    /* 3-THINGS armour-repair-room-3-nook */
    /* docs/interiors/upper-floors-gaps-1028.md (armour-repair-room-3-nook, -): a plank bench on the east wall, the tin bucket of rags on the floor, the rack of tools on the north wall (hammers, tongs, a file) */
    'armour-repair-room-3-nook': { items: [
      ['t', 35.21, 13.0, 35.51, 16.2, 0.45, 'wood'], ['y', 34.79, 16.6, 0.15, 0, 0.3, 'tin'], ['y', 34.79, 16.6, 0.12, 0.28, 0.3, 'cloth'], ['b', 33.2, 11.83, 1.0, 34.9, 11.88, 2.0, 'pine'],
      ['b', 33.24, 11.86, 1.35, 34.86, 11.97, 1.39, 'wood'], ['b', 33.24, 11.86, 1.8, 34.86, 11.97, 1.84, 'wood'], ['b', 33.43, 11.95, 1.0, 33.47, 12.03, 1.35, 'iron'], ['b', 33.37, 11.95, 0.95, 33.53, 12.03, 1.05, 'iron'],
      ['b', 33.78, 11.95, 1.0, 33.82, 12.03, 1.35, 'iron'], ['b', 33.72, 11.95, 0.95, 33.88, 12.03, 1.05, 'steel'], ['b', 34.13, 11.95, 1.0, 34.17, 12.03, 1.35, 'iron'], ['b', 34.07, 11.95, 0.95, 34.23, 12.03, 1.05, 'iron'],
      ['b', 34.48, 11.95, 1.0, 34.52, 12.03, 1.35, 'iron'], ['b', 34.42, 11.95, 0.95, 34.58, 12.03, 1.05, 'steel'], ['b', 34.7, 11.95, 1.45, 34.74, 12.01, 1.8, 'steel']] },
    /* 3-THINGS end armour-repair-room-3-nook */
    /* 3-THINGS armour-repair-room-3 */
    /* docs/interiors/upper-floors-gaps-1028.md (armour-repair-room-3, u): a worktable on the west wall with a breastplate, a pair of gauntlets, a close helmet, a hatchet and a lamp, a stool, the leather apron on a peg; one suit of armour stripped to its legs on its stand; a bench on the south wall with arm pieces on a cloth and the tin bucket of rags; the east wall left open to the nook; the door's aisle kept clear */
    'armour-repair-room-3': { items: [
      ['t', 21.67, 6.5, 22.57, 9.7, 0.85, 'oak'], ['b', 21.84, 6.8, 0.85, 22.29, 7.2, 0.895, 'steel'], ['b', 21.92, 6.88, 0.895, 22.21, 7.12, 0.93, 'steel'], ['b', 21.84, 7.5, 0.85, 22.02, 7.9, 0.88, 'leather'],
      ['b', 21.89, 7.55, 0.88, 21.99, 7.85, 0.92, 'steel'], ['b', 22.14, 7.5, 0.85, 22.32, 7.9, 0.88, 'leather'], ['b', 22.19, 7.55, 0.88, 22.29, 7.85, 0.92, 'steel'], ['y', 22.09, 8.5, 0.12, 0.85, 1.1, 'steel'],
      ['b', 22.0, 8.36, 1.0, 22.18, 8.4, 1.06, 'dark'], ['b', 21.79, 9.1, 0.85, 22.39, 9.18, 0.88, 'wood'], ['b', 22.29, 9.04, 0.85, 22.44, 9.24, 0.92, 'steel'], ['y', 22.44, 6.7, 0.06, 0.85, 0.88, 'brass'],
      ['y', 22.44, 6.7, 0.04, 0.88, 0.97, 'glass'], ['y', 22.44, 6.7, 0.025, 0.97, 1.15, 'glass'], ['b', 22.89, 7.95, 0.41, 23.19, 8.25, 0.45, 'wood'], ['b', 22.91, 7.97, 0, 22.94, 8.0, 0.41, 'wood'],
      ['b', 22.91, 8.2, 0, 22.94, 8.23, 0.41, 'wood'], ['b', 23.14, 7.97, 0, 23.17, 8.0, 0.41, 'wood'], ['b', 23.14, 8.2, 0, 23.17, 8.23, 0.41, 'wood'], ['b', 21.62, 10.1, 1.5, 21.74, 10.14, 1.54, 'iron'],
      ['b', 21.72, 9.85, 0.65, 21.77, 10.4, 1.52, 'leather'], ['b', 26.28, 11.08, 0, 26.92, 11.72, 0.06, 'oak'], ['y', 26.6, 11.4, 0.035, 0.06, 1.75, 'iron'], ['b', 26.32, 11.38, 1.38, 26.88, 11.42, 1.42, 'iron'],
      ['y', 26.5, 11.4, 0.075, 0.06, 0.85, 'steel'], ['y', 26.7, 11.4, 0.075, 0.06, 0.85, 'steel'], ['b', 26.41, 11.3, 0.85, 26.59, 11.5, 0.92, 'steel'], ['b', 26.61, 11.3, 0.85, 26.79, 11.5, 0.92, 'steel'],
      ['b', 26.38, 11.27, 0.92, 26.82, 11.53, 1.12, 'steel'], ['y', 26.6, 11.4, 0.05, 1.75, 1.78, 'steel'], ['t', 24.0, 17.5, 28.0, 17.97, 0.45, 'wood'], ['b', 24.2, 17.55, 0.45, 27.8, 17.92, 0.462, 'cloth'],
      ['y', 24.7, 17.73, 0.06, 0.462, 0.85, 'steel'], ['y', 25.7, 17.73, 0.06, 0.462, 0.85, 'steel'], ['y', 26.7, 17.73, 0.06, 0.462, 0.6, 'steel'], ['y', 28.6, 17.7, 0.15, 0, 0.3, 'tin'],
      ['y', 28.6, 17.7, 0.12, 0.28, 0.3, 'cloth']] },
    /* 3-THINGS end armour-repair-room-3 */
    /* 3-THINGS trophy-polishing-room-3 */
    /* docs/interiors/upper-floors-gaps-1028.md (trophy-polishing-room-3, ab): a worktable across the middle with cups and statuettes on folded linen, a lamp, a tin of polish and a stool each side; a case waiting on the west wall; a plank bench, the tin bucket of polish and a sack of whiting on the east wall; polishing cloths on pegs; the door's aisle kept clear */
    'trophy-polishing-room-3': { items: [
      ['t', 11.8, 10.0, 16.6, 10.9, 0.85, 'oak'], ['b', 12.0, 10.1, 0.85, 14.3, 10.8, 0.862, 'linen'], ['b', 14.6, 10.1, 0.85, 16.4, 10.8, 0.862, 'linen'], ['y', 12.35, 10.45, 0.07, 0.862, 0.892, 'ebony'],
      ['y', 12.35, 10.45, 0.015, 0.892, 1.002, 'brass'], ['y', 12.35, 10.45, 0.07, 1.002, 1.132, 'gilt'], ['y', 12.9, 10.45, 0.07, 0.862, 0.892, 'ebony'], ['y', 12.9, 10.45, 0.015, 0.892, 1.002, 'brass'],
      ['y', 12.9, 10.45, 0.07, 1.002, 1.132, 'gilt'], ['y', 13.45, 10.45, 0.07, 0.862, 0.892, 'ebony'], ['y', 13.45, 10.45, 0.015, 0.892, 1.002, 'brass'], ['y', 13.45, 10.45, 0.07, 1.002, 1.132, 'gilt'],
      ['y', 14.0, 10.45, 0.07, 0.862, 0.892, 'ebony'], ['y', 14.0, 10.45, 0.015, 0.892, 1.002, 'brass'], ['y', 14.0, 10.45, 0.07, 1.002, 1.132, 'gilt'], ['b', 14.84, 10.39, 0.862, 14.96, 10.51, 0.912, 'ebony'],
      ['y', 14.9, 10.45, 0.028, 0.912, 1.162, 'brass'], ['y', 14.9, 10.45, 0.04, 1.162, 1.202, 'brass'], ['b', 15.34, 10.39, 0.862, 15.46, 10.51, 0.912, 'ebony'], ['y', 15.4, 10.45, 0.028, 0.912, 1.162, 'brass'],
      ['y', 15.4, 10.45, 0.04, 1.162, 1.202, 'brass'], ['b', 15.84, 10.39, 0.862, 15.96, 10.51, 0.912, 'ebony'], ['y', 15.9, 10.45, 0.028, 0.912, 1.162, 'brass'], ['y', 15.9, 10.45, 0.04, 1.162, 1.202, 'brass'],
      ['y', 16.45, 10.2, 0.06, 0.85, 0.88, 'brass'], ['y', 16.45, 10.2, 0.04, 0.88, 0.97, 'glass'], ['y', 16.45, 10.2, 0.025, 0.97, 1.15, 'glass'], ['y', 14.45, 10.2, 0.05, 0.85, 0.92, 'tin'],
      ['b', 12.85, 9.45, 0.41, 13.15, 9.75, 0.45, 'wood'], ['b', 12.87, 9.47, 0, 12.9, 9.5, 0.41, 'wood'], ['b', 12.87, 9.7, 0, 12.9, 9.73, 0.41, 'wood'], ['b', 13.1, 9.47, 0, 13.13, 9.5, 0.41, 'wood'],
      ['b', 13.1, 9.7, 0, 13.13, 9.73, 0.41, 'wood'], ['b', 12.85, 11.15, 0.41, 13.15, 11.45, 0.45, 'wood'], ['b', 12.87, 11.17, 0, 12.9, 11.2, 0.41, 'wood'], ['b', 12.87, 11.4, 0, 12.9, 11.43, 0.41, 'wood'],
      ['b', 13.1, 11.17, 0, 13.13, 11.2, 0.41, 'wood'], ['b', 13.1, 11.4, 0, 13.13, 11.43, 0.41, 'wood'], ['b', 15.25, 9.45, 0.41, 15.55, 9.75, 0.45, 'wood'], ['b', 15.27, 9.47, 0, 15.3, 9.5, 0.41, 'wood'],
      ['b', 15.27, 9.7, 0, 15.3, 9.73, 0.41, 'wood'], ['b', 15.5, 9.47, 0, 15.53, 9.5, 0.41, 'wood'], ['b', 15.5, 9.7, 0, 15.53, 9.73, 0.41, 'wood'], ['b', 15.25, 11.15, 0.41, 15.55, 11.45, 0.45, 'wood'],
      ['b', 15.27, 11.17, 0, 15.3, 11.2, 0.41, 'wood'], ['b', 15.27, 11.4, 0, 15.3, 11.43, 0.41, 'wood'], ['b', 15.5, 11.17, 0, 15.53, 11.2, 0.41, 'wood'], ['b', 15.5, 11.4, 0, 15.53, 11.43, 0.41, 'wood'],
      ['b', 7.23, 11.4, 0, 7.75, 13.4, 0.25, 'oak'], ['b', 7.23, 11.4, 1.82, 7.75, 13.4, 1.9, 'oak'], ['b', 7.23, 11.4, 0.25, 7.29, 13.4, 1.82, 'oak'], ['b', 7.71, 11.4, 0.25, 7.75, 13.4, 1.82, 'oak'],
      ['b', 7.23, 11.4, 0.25, 7.75, 11.44, 1.82, 'oak'], ['b', 7.23, 13.36, 0.25, 7.75, 13.4, 1.82, 'oak'], ['b', 7.29, 11.44, 0.7, 7.71, 13.36, 0.715, 'oak'], ['b', 7.29, 11.44, 1.15, 7.71, 13.36, 1.165, 'oak'],
      ['b', 7.29, 11.44, 1.6, 7.71, 13.36, 1.615, 'oak'], ['b', 7.29, 11.44, 0.25, 7.71, 13.36, 0.27, 'cloth'], ['t', 20.81, 9.0, 21.11, 12.0, 0.45, 'wood'], ['y', 20.44, 9.4, 0.15, 0, 0.3, 'tin'],
      ['y', 20.44, 9.4, 0.12, 0.28, 0.3, 'dark'], ['b', 20.69, 12.6, 0, 21.11, 13.2, 0.4, 'canvas'], ['b', 17.78, 3.83, 1.58, 17.82, 3.95, 1.62, 'iron'], ['b', 17.73, 3.93, 0.95, 17.87, 3.97, 1.58, 'cloth'],
      ['b', 18.18, 3.83, 1.58, 18.22, 3.95, 1.62, 'iron'], ['b', 18.13, 3.93, 0.95, 18.27, 3.97, 1.58, 'cloth'], ['b', 18.58, 3.83, 1.58, 18.62, 3.95, 1.62, 'iron'], ['b', 18.53, 3.93, 0.95, 18.67, 3.97, 1.58, 'cloth']] },
    /* 3-THINGS end trophy-polishing-room-3 */
  };
  Object.keys(things).forEach(function (k) {
    if (T[k]) { T[k].items = T[k].items.concat(things[k].items); } else { T[k] = things[k]; }
  });
})(window.SHELL_W5A.things);
