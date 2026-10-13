/* The castle model: the one to-scale record of where everything in the castle is, read by the room pages, the
   Marauder's Map and the plan sheets (tools/castle-model.py reads the same block). Plain data only, one JSON object,
   so the line below and the closing one are the only code. Metres. The plan: x east, y north; z up.
   A group (a suite of rooms built together) has its own plan frame, placed in the castle by its place: model point =
   (place.x, place.y) + the group's point turned by place.turn degrees (counter-clockwise), and z = place.z + z.
   A page's own three.js point (x, y, z) maps into its group as (x, -z) turned by the room's frame.turn and moved by
   frame.x, frame.y; its height y as frame.z + y. A state is built (on a page), designed (settled, not built),
   books (the books fix it), proposed (the Architect's, open), or pending (waiting on a question). A bearing is in
   degrees about a round room's centre, from the group's y toward its x (clockwise seen from above); a cant is the
   degrees a window's outer opening turns from its bearing. The castle's own frame (site): the block's south-west
   corner at x 0, y 0, y true north. A room with no group, and every mass, court and tower, is in that frame. */
window.CASTLE_MODEL = {
  "version": 14,
  "units": "metres",
  "site": {
    "block": [0, 0, 160, 72], "front": "north", "lake": "south", "state": "designed",
    "storey": 5.2, "storey_about": "Godric's 3.1 (12 October 2026, 6.23 pm): the corridor's built 4.5 m and a 0.7 m vault, every moving flight alike; the Great Hall and the Entrance Hall rise through two storeys, the Entrance Hall opening into the stair hall's well, its ceiling too high to make out (PS 7)",
    "about": "One long east-west block, the front doors on the north, the lake and the cliff on the south (Godric's 2.1, 12 October 2026, 5.57 pm). One stair hall runs from the north range to the south face, the marble and moving staircases in its well.",
    "cite": "the author's grounds sketch (the southern approach over the lake, the front entrance at the north); PS 7, PS 8, HBP 24"
  },
  "grounds": [
    {"id": "lake", "shape": {"poly": [[-20, -8], [-12.2, -8.2], [-9.8, -7.2], [-7.2, -7.8], [-5.0, -9.2], [-2.6, -10.0], [0.0, -10.2], [9.9, -8.5], [17.6, -8.9], [20.0, -8.0], [24.8, -9.9], [27.4, -10.1], [29.8, -11.0], [32.4, -11.3], [45.2, -9.5], [49.8, -7.1], [57.5, -7.4], [60.0, -8.0], [65.0, -6.9], [67.4, -7.5], [72.6, -7.6], [74.9, -8.6], [85.1, -7.7], [90.0, -9.2], [94.9, -7.9], [102.6, -8.1], [105.1, -7.4], [110.2, -7.9], [112.4, -6.6], [117.4, -5.2], [120.0, -5.0], [122.4, -6.0], [130.0, -6.5], [132.4, -7.3], [137.6, -7.2], [142.5, -8.3], [147.6, -8.1], [150.0, -7.2], [152.5, -7.7], [157.5, -8.0], [162.5, -7.3], [172.5, -8.8], [180, -8], [181.4, -9.2], [184.6, -7.7], [186.2, -7.8], [186.9, -9.4], [189.9, -10.8], [191.4, -11.3], [194.6, -11.3], [197.7, -10.7], [199.0, -9.8], [199.8, -8.3], [201.5, -8.1], [202.3, -6.5], [201.6, -8.1], [201.4, -11.7], [200.3, -13.1], [201.6, -14.3], [202.2, -16.0], [204.0, -16.9], [204.1, -18.9], [203.3, -21.0], [204.3, -23.0], [207.9, -24.8], [209.7, -24.2], [213.2, -25.1], [215, -25], [218.9, -25.7], [221.5, -27.0], [224.8, -27.0], [227.5, -25.8], [232.4, -26.7], [233.8, -27.5], [235.0, -29.2], [239.9, -33.6], [249.7, -36.1], [253.5, -36.6], [262, -40], [264.0, -34.6], [263.7, -32.0], [264.5, -28.2], [264.2, -24.4], [265.3, -18.0], [267.1, -14.6], [266.9, -8.2], [268.0, -3.2], [268.5, 2.9], [271.0, 6.9], [271.9, 11.6], [274.8, 16.8], [274.5, 19.1], [272.7, 22.3], [273.0, 28.7], [275.8, 35.4], [275.2, 39.6], [274.2, 42.5], [274.9, 50.0], [277.1, 53.7], [279.6, 55.5], [283.4, 60.5], [284.8, 65.5], [284.6, 68.8], [285.6, 73.1], [287.6, 78.3], [291, 82], [302, 84], [307.5, 81.2], [308.8, 78.5], [311.0, 76.6], [311.3, 74.1], [310.6, 70.1], [312.0, 68.0], [313.6, 62.5], [315.6, 59.8], [316.6, 56.6], [316.0, 52.4], [318.9, 46.6], [319.2, 43.3], [320.8, 39.2], [320.9, 35.9], [322.4, 32.8], [322.2, 28.1], [319.3, 22.0], [319.1, 18.6], [320.0, 15.2], [320.0, 11.6], [317.9, 4.9], [318.9, 1.6], [319.4, -1.9], [319.9, -3.0], [323.5, -6.1], [326.2, -9.9], [327.2, -12.0], [327.8, -15.4], [328.5, -16.2], [331.6, -17.8], [334.9, -21.0], [337.6, -26.0], [339.7, -28.7], [340.6, -30.8], [340.9, -34.2], [343.2, -38.1], [343.5, -41.5], [346, -46], [347.4, -47.2], [349.6, -48.2], [355.6, -48.6], [359.7, -53.1], [364.3, -54.6], [370.9, -59.8], [378.2, -59.4], [384.4, -61.1], [387.4, -62.6], [389.9, -62.6], [393.2, -65.2], [395.1, -68.1], [399.9, -69.7], [402.9, -72.5], [407.1, -73.2], [410.3, -74.8], [413.8, -79.6], [416.2, -80.3], [418.6, -82.5], [425, -85], [430.1, -88.1], [431.5, -90.1], [431.1, -93.0], [436.0, -98.7], [437.1, -101.1], [436.2, -109.1], [436.9, -110.3], [438.3, -111.0], [438.8, -112.8], [437.5, -117.9], [437.6, -121.8], [436.1, -125.9], [436.7, -128.7], [439.2, -133.3], [438.7, -136.3], [436.5, -138.2], [438.2, -140.8], [437.7, -144.0], [439.4, -149.2], [441.0, -151.9], [441.1, -152.8], [440.3, -154.2], [440.7, -154.8], [444.7, -156.3], [446.8, -158.7], [449.6, -159.9], [450.0, -160.6], [450.6, -165.2], [449.8, -167.4], [447.7, -170.5], [447.4, -173.0], [449.3, -176.1], [450.6, -180.9], [453.1, -183.8], [455.1, -185.2], [455.5, -186.1], [454.7, -189.6], [455.0, -194.4], [456.5, -197.6], [456.8, -201.2], [455.3, -205.7], [455.5, -210.4], [454.4, -213.5], [456.3, -217.9], [455.6, -221.5], [458.3, -227.7], [460.2, -230.5], [461.7, -234.9], [463.5, -237.8], [463.8, -246.7], [463.1, -250.2], [463.5, -251.4], [465.7, -254.2], [466.0, -255.4], [465.7, -257.9], [464.3, -259.8], [464.1, -260.8], [465.0, -263.1], [465.2, -266.9], [463.9, -270.2], [463.9, -271.5], [464.8, -273.7], [464.5, -274.6], [462.6, -276.3], [462.4, -277.6], [463.0, -283.8], [463.5, -285.0], [462.9, -288.5], [464.6, -292.9], [467.4, -295.2], [468.9, -297.2], [470.4, -301.9], [469.5, -305.6], [470.3, -309.2], [469.0, -313.0], [469.3, -315.7], [468.7, -317.0], [466.2, -318.2], [465.6, -318.9], [466.7, -322.6], [468.2, -324.8], [468.3, -327.4], [468.9, -328.0], [471.5, -328.4], [474.9, -330.7], [476.4, -332.9], [476.1, -335.2], [474.7, -337.2], [475.4, -340.5], [475.2, -342.9], [478.2, -347.7], [480.3, -356.5], [481.9, -358.1], [481.9, -358.9], [480.8, -361.0], [480.9, -362.3], [483.5, -367.6], [483.8, -374.4], [490.0, -383.7], [489.7, -387.1], [488.3, -389.0], [487.7, -391.2], [490.7, -397.6], [490.1, -400.5], [493.2, -412.6], [494.9, -424.3], [498.9, -442.0], [499.9, -449.0], [496.4, -462.1], [490.0, -480.0], [488.7, -481.9], [488.9, -484.2], [488.2, -486.3], [486.8, -488.0], [484.8, -489.0], [483.6, -490.9], [480.0, -493.3], [479.5, -496.0], [480.7, -498.6], [484.9, -501.7], [485.8, -504.4], [484.2, -506.8], [481.9, -508.2], [480.0, -510.0], [479.6, -512.5], [477.5, -513.9], [477.2, -516.2], [476.1, -518.3], [480.8, -529.1], [479.2, -531.1], [476.8, -531.7], [475.3, -533.6], [475.5, -536.0], [472.0, -539.0], [470.0, -540.0], [466.4, -547.1], [466.2, -549.7], [463.9, -550.7], [463.9, -553.0], [465.0, -555.0], [464.1, -556.9], [462.6, -558.4], [461.7, -560.6], [462.9, -562.6], [461.6, -564.2], [459.9, -567.9], [460.0, -570.0], [459.1, -572.1], [457.1, -573.2], [456.0, -575.0], [454.3, -576.4], [456.8, -577.7], [457.0, -580.5], [454.8, -584.9], [455.6, -587.0], [452.1, -592.4], [452.4, -594.4], [450.0, -600.0], [445.6, -600.5], [443.7, -601.8], [441.4, -601.6], [439.0, -600.6], [436.7, -601.7], [435.9, -604.3], [433.4, -605.2], [432.0, -607.3], [429.5, -607.4], [427.3, -608.2], [425.1, -607.7], [423.4, -609.5], [421.0, -609.2], [418.9, -609.9], [416.7, -610.0], [414.0, -609.5], [412.3, -607.5], [410.2, -609.3], [407.4, -608.7], [403.1, -610.7], [401.7, -612.7], [397.7, -615.5], [395.2, -614.9], [390.1, -619.5], [387.9, -620.1], [383.3, -620.0], [381.1, -621.0], [376.3, -621.7], [373.9, -621.6], [371.4, -622.4], [370.0, -624.6], [367.9, -626.3], [367.9, -629.0], [364.0, -625.5], [358.7, -625.5], [354.9, -628.8], [352.6, -630.2], [350.0, -630.0], [346.2, -625.9], [335.6, -626.3], [333.1, -625.6], [327.6, -625.0], [324.9, -626.5], [324.0, -627.9], [322.4, -628.3], [321.3, -629.7], [322.1, -631.4], [317.5, -634.5], [316.5, -637.2], [316.7, -640.0], [315.3, -642.0], [309.0, -644.6], [304.7, -645.9], [302.5, -644.7], [300.1, -645.4], [295.7, -642.6], [293.0, -642.3], [290.6, -643.4], [289.2, -645.5], [287.2, -647.0], [286.0, -649.5], [283.3, -650.0], [282.0, -651.5], [280.0, -651.0], [277.1, -649.1], [276.2, -652.3], [273.4, -654.2], [271.7, -654.2], [270.2, -655.1], [269.3, -653.6], [264.9, -651.3], [263.9, -649.7], [264.6, -648.0], [261.9, -649.1], [260.7, -651.7], [258.0, -650.5], [255.3, -651.6], [254.3, -654.3], [251.6, -655.1], [250.5, -657.4], [250.0, -660.0], [246.5, -656.2], [239.0, -657.3], [236.6, -656.5], [234.2, -656.7], [232.2, -658.0], [229.1, -662.9], [226.1, -661.8], [223.4, -663.4], [215.9, -660.8], [214.3, -658.6], [211.4, -659.7], [208.3, -660.0], [207.7, -661.8], [208.9, -663.4], [206.9, -663.8], [206.3, -665.8], [204.8, -665.2], [203.3, -666.0], [202.9, -667.6], [201.5, -668.5], [198.8, -668.0], [194.5, -668.9], [193.1, -669.7], [191.6, -668.9], [188.3, -670.5], [186.5, -669.8], [184.9, -668.8], [183.8, -664.0], [179.7, -659.8], [177.2, -654.9], [175.4, -652.9], [172.8, -651.7], [167.6, -653.9], [165.2, -652.4], [163.6, -654.7], [160.8, -654.7], [159.0, -656.6], [153.8, -657.3], [152.1, -659.4], [149.3, -660.2], [147.2, -658.2], [144.6, -657.7], [142.9, -655.7], [141.4, -655.1], [139.8, -655.4], [139.3, -657.0], [137.9, -657.9], [132.6, -664.0], [127.1, -664.3], [124.6, -665.4], [123.5, -664.0], [121.7, -664.1], [120.3, -663.5], [118.1, -661.0], [117.9, -659.3], [118.8, -657.8], [118.3, -656.1], [116.7, -656.1], [115.3, -655.6], [112.9, -653.7], [111.4, -654.3], [110.2, -655.6], [108.4, -655.7], [107.1, -654.3], [104.3, -655.0], [101.5, -654.5], [99.3, -652.5], [98.6, -649.6], [95.9, -650.1], [93.2, -649.7], [89.6, -645.8], [88.8, -648.6], [85.9, -649.5], [84.4, -651.8], [81.9, -652.9], [80.3, -652.2], [79.7, -650.6], [78.4, -649.5], [73.1, -649.8], [72.6, -651.5], [71.4, -652.9], [70.4, -657.5], [67.6, -659.3], [67.5, -661.0], [65.0, -662.7], [63.9, -661.3], [62.4, -660.5], [60.5, -660.8], [59.1, -659.4], [55.6, -659.9], [53.2, -662.4], [52.1, -659.8], [47.7, -656.4], [46.4, -653.9], [43.5, -654.5], [37.5, -654.1], [36.2, -653.0], [35.7, -651.4], [33.1, -650.3], [32.3, -647.6], [25.1, -644.8], [23.2, -643.1], [20.4, -643.9], [18.2, -642.0], [17.5, -644.8], [13.7, -649.3], [10.7, -649.6], [8.1, -648.4], [2.5, -648.8], [0.0, -650.0], [-2.4, -649.3], [-4.9, -649.3], [-7.4, -649.8], [-9.2, -651.5], [-10.3, -649.1], [-12.9, -648.6], [-15.0, -647.5], [-16.7, -645.9], [-19.1, -647.0], [-20.9, -648.9], [-23.1, -647.1], [-28.4, -647.1], [-30.4, -645.5], [-31.1, -643.1], [-37.3, -638.5], [-41.9, -636.7], [-43.7, -634.3], [-46.7, -634.1], [-46.5, -631.2], [-47.8, -628.7], [-49.5, -628.5], [-50.6, -627.1], [-53.5, -628.4], [-58.5, -625.8], [-60.1, -626.5], [-60.5, -628.2], [-63.7, -628.4], [-64.2, -631.5], [-65.9, -631.7], [-66.7, -633.3], [-68.0, -630.9], [-70.7, -630.2], [-72.9, -628.3], [-72.5, -625.5], [-77.9, -625.5], [-80.6, -624.2], [-81.4, -621.4], [-84.0, -621.0], [-89.5, -621.9], [-90.4, -624.7], [-92.9, -626.0], [-95.2, -624.5], [-107.1, -625.0], [-108.7, -623.1], [-110.9, -622.5], [-117.5, -624.1], [-119.2, -622.2], [-119.7, -619.6], [-123.5, -616.4], [-125.9, -615.5], [-130.8, -617.4], [-133.3, -616.7], [-138.3, -614.2], [-139.8, -616.8], [-141.4, -616.6], [-145.6, -618.2], [-148.0, -616.6], [-150.9, -617.4], [-151.9, -620.2], [-153.7, -618.4], [-156.3, -618.2], [-160.1, -615.3], [-161.7, -614.7], [-163.1, -615.7], [-163.3, -614.0], [-164.9, -613.2], [-165.1, -610.5], [-166.7, -608.3], [-168.2, -607.5], [-168.6, -605.9], [-172.8, -603.2], [-176.1, -604.2], [-177.3, -605.5], [-178.8, -602.8], [-178.0, -599.9], [-178.9, -597.1], [-181.1, -595.2], [-182.5, -595.8], [-184.1, -595.7], [-185.1, -596.9], [-185.6, -598.4], [-190.8, -596.5], [-193.1, -597.6], [-194.9, -599.5], [-200, -600], [-201.2, -596.0], [-204.4, -592.1], [-208.7, -585.1], [-209.9, -582.0], [-214.2, -578.2], [-215.8, -576.0], [-216.7, -572.2], [-218.0, -569.7], [-219.1, -564.7], [-220.9, -561.1], [-221.0, -556.5], [-222.1, -553.8], [-223.6, -552.0], [-227.8, -549.0], [-230.8, -544.1], [-236.4, -539.2], [-238.0, -535.0], [-240.6, -532.1], [-242.6, -525.2], [-244.3, -522.2], [-246.7, -519.7], [-247.6, -515.8], [-249.3, -514.5], [-251.9, -511.4], [-254.1, -509.7], [-256.3, -506.6], [-258.8, -504.4], [-260.3, -500.8], [-269.1, -488.1], [-271.0, -481.7], [-275.2, -474.8], [-276.4, -464.6], [-279.1, -460.8], [-281.9, -455.0], [-285.8, -451.4], [-289.6, -449.9], [-290.0, -449.2], [-291.7, -442.0], [-291.0, -439.5], [-291.5, -434.6], [-290.9, -427.2], [-292.1, -423.6], [-293.5, -413.6], [-296.0, -408.7], [-294.6, -399.7], [-295.5, -392.4], [-296.4, -389.4], [-296.2, -385.1], [-297.7, -379.0], [-297.8, -373.7], [-297.4, -369.5], [-297.8, -366.9], [-297.3, -364.3], [-297.0, -358.4], [-299.3, -354.7], [-299.9, -350.8], [-298.3, -341.8], [-301.1, -331.9], [-300.5, -326.6], [-301.9, -323.1], [-303.2, -316.9], [-303.4, -311.0], [-302.8, -308.0], [-303.4, -305.4], [-302.6, -295.2], [-302.8, -291.4], [-303.4, -289.3], [-305.8, -286.2], [-306.5, -284.2], [-304.2, -277.5], [-305.1, -271.0], [-304.8, -267.7], [-306.6, -262.6], [-306.6, -259.3], [-310.0, -249.2], [-309.2, -243.6], [-307.9, -239.9], [-310.2, -228.3], [-307.1, -219.0], [-304.2, -215.7], [-304.9, -210.2], [-303.7, -202.0], [-304.1, -198.7], [-300.1, -193.4], [-299.9, -188.2], [-298.9, -183.8], [-294.6, -177.0], [-293.4, -169.7], [-291.3, -167.1], [-290.6, -164.9], [-290.6, -158.8], [-292.4, -152.3], [-291.8, -150.1], [-292.0, -146.1], [-289.9, -137.1], [-290.0, -133.3], [-289.6, -130.6], [-290.2, -126.2], [-288.9, -121.4], [-285.8, -113.2], [-284.9, -105.3], [-284.0, -103.8], [-281.0, -101.1], [-278.0, -93.6], [-278.8, -86.8], [-278.7, -84.0], [-280.0, -79.1], [-279.6, -74.2], [-279.8, -70.5], [-277.4, -66.3], [-276.5, -63.4], [-273.3, -59.5], [-270.8, -53.9], [-269.3, -48.5], [-270.2, -41.8], [-270.2, -36.2], [-270.9, -33.8], [-270.2, -30.2], [-270.4, -25.8], [-266.8, -18.6], [-264.5, -11.5], [-263.1, -9.4], [-260.1, -6.3], [-259.4, -4.0], [-255.7, 3.8], [-255.0, 8.8], [-256.0, 12.3], [-255.1, 14.4], [-254.6, 18.7], [-250.5, 26.7], [-250, 30], [-246.9, 34.0], [-240.5, 40.0], [-235.5, 47.6], [-232.3, 51.4], [-221.5, 60.4], [-217.1, 65.4], [-214.6, 67.5], [-212.0, 70.6], [-209.7, 74.7], [-203.6, 81.8], [-200.1, 84.8], [-191.2, 88.1], [-186.1, 87.9], [-180.1, 89.4], [-175.4, 88.8], [-169.5, 88.8], [-160.1, 90.7], [-154.0, 89.9], [-147.2, 91.7], [-143.1, 92.3], [-138.4, 92.3], [-132.3, 93.7], [-130, 95], [-127.6, 94.3], [-124.9, 91.3], [-120.6, 88.5], [-117.6, 88.6], [-115.6, 88.0], [-114.9, 87.3], [-113.8, 84.6], [-111.1, 81.6], [-107.2, 80.4], [-104.5, 77.4], [-100.9, 75.7], [-96.7, 71.5], [-94.1, 67.4], [-89.8, 64.7], [-86.8, 64.5], [-85.2, 62.2], [-80, 60], [-80.3, 57.8], [-81.6, 56.0], [-79.5, 54.8], [-79.1, 50.4], [-79.7, 48.3], [-77.8, 47.2], [-76.4, 45.5], [-74.2, 45.4], [-72.2, 46.4], [-70.0, 45.5], [-69.3, 43.2], [-67.8, 41.9], [-65.8, 41.8], [-64.4, 40.4], [-62.5, 40.0], [-61.5, 36.1], [-59.5, 35.3], [-58.3, 33.5], [-58.6, 31.5], [-59.5, 29.7], [-58.6, 27.9], [-58.5, 25.8], [-54.7, 25.2], [-54.0, 23.2], [-52.0, 22.3], [-51.2, 20.3], [-49.1, 19.4], [-47.1, 20.3], [-45.0, 20.0], [-44.0, 16.8], [-40.8, 16.0], [-40.2, 14.6], [-39.9, 13.0], [-40.3, 11.3], [-41.7, 10.3], [-37.8, 6.7], [-35.0, 7.3], [-32.4, 6.1], [-28.7, 2.8], [-28.5, 0.3], [-27.3, -1.9], [-25.4, -3.6], [-24.5, -5.9], [-21.6, -5.7]]}, "state": "books", "about": "south under the cliff, its east arm round the south-east corner, a west bay; an arm about 140 m long reaching north from the east shore to the beech, 46 m below the lawn in a glen (Godric's 225.1)", "cite": "PS 6, OotP 29, HBP 30; Godric's 4.1 (12 October 2026, 7.01 pm); Godric's 225.1 (13 October 2026, 10.55 am); Godric's 11.2 (13 October 2026, 1.52 pm)", "shores": [["cliff", 0], ["rock", 42], ["grass", 67], ["glen", 78], ["grass", 105], ["glen", 106], ["shrub", 144], ["forest", 164], ["pebble", 268], ["rock", 274], ["grass", 598], ["bay", 729], ["shrub", 752], ["rock", 769]], "shores_about": "Godric's 11.2 (13 October 2026, 1.52 pm: \"Make edges more naturally rough and contoured with the highlands landscape\"): the built outline (225.1) kept, nothing added, each stretch roughened by the kind its ground makes; a run is [kind, the poly's index it starts at], to the next run's start. tools/architect-lake-ring.py (seed 8) from tools/architect-shore-sheet.py's kinds."},
    {"id": "forbidden-forest", "shape": {"poly": [[300, 440], [330, 330], [362, 240], [400, 160], [425, 100], [432, 40], [425, -20], [440, -90], [470, -160], [490, -300], [640, -300], [640, 440]]}, "state": "books", "about": "from the north-east down the east side to the water", "cite": "PS 8, PS 9, HBP 30; Godric's 4.1 (12 October 2026, 7.01 pm)"},
    {"id": "hagrids-cabin", "shape": {"point": [396.7, 64.5]}, "state": "books", "about": "on the forest's edge, 80 degrees and 360 m from Gryffindor Tower: into the April sunrise from the dormitory's W2, 9 degrees right of its axis (Godric's 225.1); a pumpkin patch behind, a paddock by it", "cite": "PS 8, CoS 7, PoA 6, OotP 11, OotP 29, GoF 24; Godric's 4.1 (12 October 2026, 7.01 pm)"},
    {"id": "beech", "shape": {"point": [297.8, 89.0]}, "state": "books", "about": "at the head of the lake's arm, on its edge, on the dormitory's W2 axis, the window beside Neville's corner bed (71.2 degrees, 270 m from Gryffindor Tower); one worn patch of grass under it (Godric's t2)", "cite": "OotP 17, OotP 28, OotP 29, CoS 15; Godric's 4.1 (12 October 2026, 7.01 pm); Godric's 225.1 (13 October 2026, 10.55 am)"},
    {"id": "whomping-willow", "shape": {"point": [255.0, 110.0]}, "state": "proposed", "about": "between the castle and the cabin, clear of the lake's arm, about 50 m north-west of the beech", "cite": "CoS 5, PoA 17; Godric's 4.1 (12 October 2026, 7.01 pm); Godric's 225.1 (13 October 2026, 10.55 am)"},
    {"id": "greenhouses", "shape": {"rects": [[200, 24, 236, 30], [200, 33, 236, 39], [200, 42, 236, 48], [200, 51, 236, 57]]}, "state": "proposed", "about": "across the vegetable patch at the castle's east end (\"behind the castle\")", "cite": "PS 8, CoS 6; Godric's 4.1 (12 October 2026, 7.01 pm)"},
    {"id": "vegetable-patch", "shape": {"rect": [166, 22, 194, 62]}, "state": "proposed", "about": "between the castle and the greenhouses", "cite": "CoS 6; Godric's 4.1 (12 October 2026, 7.01 pm)"},
    {"id": "quidditch-pitch", "shape": {"ellipse": [-120.0, 230.0, 27.5, 76]}, "state": "proposed", "about": "north-west, down the sloping lawns, opposite the forest", "cite": "CoS 7, OotP 19; Godric's 4.1 (12 October 2026, 7.01 pm)"},
    {"id": "flying-lawn", "shape": {"rect": [-80, 105, -20, 145]}, "state": "proposed", "about": "west, on the opposite side of the grounds to the forest", "cite": "PS 9; Godric's 4.1 (12 October 2026, 7.01 pm)"},
    {"id": "gates", "shape": {"point": [80.0, 330.0]}, "state": "books", "about": "stone pillars topped with winged boars, the drive sweeping up to the front doors (258 m)", "cite": "PoA 5, GoF 12; Godric's 4.1 (12 October 2026, 7.01 pm)"},
    {"id": "drive", "shape": {"line": [[80.0, 72.0], [86, 140], [72, 230], [80, 330]]}, "state": "proposed", "about": "the front doors to the gates", "cite": "GoF 12; Godric's 4.1 (12 October 2026, 7.01 pm)"},
    {"id": "road-to-hogsmeade", "shape": {"line": [[80, 330], [78, 350], [0, 362], [-150, 382], [-320, 404]]}, "state": "books", "about": "left out of the gates to the village", "cite": "OotP 16; Godric's 4.1 (12 October 2026, 7.01 pm)"},
    {"id": "beauxbatons-carriage", "shape": {"point": [240.0, 160.0]}, "state": "books", "about": "200 yards from Hagrid's door, in GoF's year only", "cite": "GoF 16; Godric's 4.1 (12 October 2026, 7.01 pm)"},
    {"id": "durmstrang-ship", "shape": {"point": [-170.0, 52.0]}, "state": "proposed", "about": "moored in the lake's west bay, in GoF's year only", "cite": "GoF 18, GoF 24, GoF 35; Godric's 4.1 (12 October 2026, 7.01 pm)"},
    {"id": "white-tomb", "shape": {"point": [250.0, -30.0]}, "state": "proposed", "about": "beside the lake, looking over the east arm to the forest", "cite": "HBP 30, DH 24; Godric's 4.1 (12 October 2026, 7.01 pm)"},
    {"id": "station", "shape": {"point": [545.0, -445.0]}, "state": "proposed", "about": "across the lake to the south-east; the boats cross to the harbour under the cliff", "cite": "PS 6; Godric's 4.1 (12 October 2026, 7.01 pm)"},
    {"id": "harbour", "shape": {"point": [86.0, -6.0]}, "state": "books", "about": "under the cliff, a passage in the rock up to the grass by the front steps", "cite": "PS 6; Godric's 4.1 (12 October 2026, 7.01 pm)"}
  ],
  "ages": [
    { "key": "P1", "name": "the founders", "years": "about 990" },
    { "key": "P2", "name": "the first walls", "years": "1100 to 1200" },
    { "key": "P3", "name": "the towers of the houses", "years": "1250 to 1350" },
    { "key": "P4", "name": "the high towers", "years": "1400 to 1500" },
    { "key": "P5", "name": "Tudor", "years": "1500 to 1600" },
    { "key": "P6", "name": "the turret builders", "years": "1600 to 1750" },
    { "key": "P7", "name": "the last additions", "years": "1800 to 1900" }
  ],
  "ages_about": "The history's seven ages (docs/architect/hogwarts-history-2026-10-12.md), proposed under Godric's 6.1 (13 October 2026, 7.13 am): each mass and tower lists the ages that built or raised it, the first the oldest (tools/architect-accreted-castle.py's pieces by footprint).",
  "masses": [
    { "id": "north range", "rect": [0, 50, 160, 72], "floors": "G-7", "state": "designed", "ages": ["P2", "P3", "P4", "P5"] },
    { "id": "south range, west", "rect": [0, 0, 68, 18], "floors": "G-7", "state": "designed", "ages": ["P3", "P5"], "roof": 41.6, "parapet": 42.6, "about": "rises to the seventh floor for the Gryffindor corridor; a lead flat behind battlements, low enough that the dormitory's east windows (sills at 44.9) see over it" },
    { "id": "south range, east", "rect": [92, 0, 160, 18], "floors": "G-6", "state": "designed", "ages": ["P3", "P4", "P6"] },
    { "id": "west range", "rect": [0, 18, 16, 50], "floors": "G-7", "state": "designed", "ages": ["P3", "P6"] },
    { "id": "east range", "rect": [144, 18, 160, 50], "floors": "G-7", "state": "designed", "ages": ["P3", "P4"] },
    { "id": "stair hall", "rect": [68, 0, 92, 50], "floors": "G-7", "core": true, "state": "designed", "ages": ["P1", "P4"], "about": "the front doors to the cliff face, the marble and moving staircases in one well" },
    { "id": "cellars", "rect": [0, 0, 160, 72], "floors": "B", "state": "designed" }
  ],
  "courts": [
    { "id": "west courtyard", "rect": [16, 18, 68, 50], "state": "designed" },
    { "id": "east courtyard", "rect": [92, 18, 144, 50], "state": "designed" }
  ],
  "towers": [
    { "id": "Astronomy Tower", "c": [80, 77], "r": 8, "floors": "G-T", "high": true, "state": "designed", "ages": ["P2", "P4", "P6"], "about": "over the front doors", "cite": "DH 31, OotP 31, HBP 27", "eaves": 82.0, "top": 83.2, "stair_top": 87.0, "classroom": [75.8, 81.3], "heights_state": "proposed", "heights_about": "Godric's 235.1 (13 October 2026, 12.18 pm; req 235, sheet architect-req235-0935): raised a stage to stay the highest (HBP 27) over the houses' raised towers: the ramparts 83.2 (were 67.2), its stair turret's cap 87.0, the classroom 75.8 to 81.3" },
    { "id": "Ravenclaw Tower", "c": [-7.5, 34], "r": 8.5, "floors": "G-T", "high": true, "state": "designed", "ages": ["P3", "P5", "P6"], "about": "on the west side", "cite": "DH 31, OotP 18, DH 29", "eaves": 66.8, "ridge": 77.1, "heights_state": "proposed", "heights_about": "Godric's 235.1 (13 October 2026, 12.18 pm; req 235, sheet architect-req235-0935): the common room lowered to the seventh floor (+36.4 to 42.6), the drum split into a boys' and a girls' half a level, seven levels over it (see dormitories); the eaves were 53.7, the cone 64.0" },
    { "id": "Gryffindor Tower", "c": [42.19, 1.95], "r": 6.4, "floors": "G-T", "high": true, "group": "gryffindor-suite", "state": "designed", "ages": ["P3", "P5", "P6"], "about": "the suite's tower (5.6 inside, a 0.8 wall), standing 4.45 m proud of the south face", "cite": "DH 31, OotP 21, OotP 29", "eaves": 69.1, "ridge": 80.4, "heights_state": "proposed", "heights_about": "Godric's 235.1 (13 October 2026, 12.18 pm; req 235, sheet architect-req235-0935): seven boys' rooms up the tower's stair, the built dormitory the seventh at the top (+64.2); the eaves were 48.7, the cone 60.0 (see dormitories)" },
    { "id": "Gryffindor girls' tower", "c": [42.19, 13.95], "r": 6.4, "floors": "7-T", "state": "proposed", "eaves": 69.1, "ridge": 80.4, "about": "the girls' drum, the built tower's size 12 m north of it, the two sharing a stretch of wall; it rises from the south range at the seventh floor, behind the tower seen from the lake; its stair hall at the common room's level, entered through the shared wall (the door's place the Common room's), seven rooms over it at the boys' levels (Godric's 235.1 (13 October 2026, 12.18 pm; req 235, sheet architect-req235-0935))", "cite": "PS 7, OotP 17" },
    { "id": "West Tower", "c": [0, 72], "r": 8, "floors": "G-T", "state": "proposed", "ages": ["P2", "P3", "P4", "P6"], "about": "lower than the three highest" },
    { "id": "North Tower", "c": [160, 72], "r": 7.5, "floors": "G-T", "state": "proposed", "ages": ["P2", "P4", "P5", "P6"], "about": "lower than the three highest", "cite": "PoA 6, PoA 16" },
    { "id": "south-west tower", "c": [0, 0], "r": 7, "floors": "G-T", "state": "proposed", "ages": ["P2", "P4", "P5", "P6"], "about": "lower than the three highest" },
    { "id": "Dumbledore's tower", "c": [166, 40], "r": 6, "floors": "G-T", "state": "proposed", "ages": ["P4", "P5", "P6"], "about": "lower than the three highest" }
  ],
  "groups": [
    {
      "id": "gryffindor-suite",
      "name": "Gryffindor Tower and the Fat Lady's corridor, seventh floor",
      "about": "The group's frame: the tower's centre at the origin, y out through the round hole along the corridor toward its stair, x to the right looking that way; z 0 the seventh floor.",
      "place": { "x": 42.19, "y": 1.95, "turn": -90, "z": 36.4, "state": "designed",
        "about": "Godric's 1.1 (12 October 2026, 5.57 pm): the corridor along the south front, its windows over the lake, the tower at its west end, its landing on the stair hall's seventh floor (the landing's end at x 68). The group's y points east, its x south. z is the seventh floor's (Godric's 3.1, 6.23 pm).",
        "cite": "OotP 21, OotP 29, PoA 14" }
    }
  ],
  "levels": [
    { "id": "B", "name": "the cellars", "z": -5.2, "state": "designed" },
    { "id": "G", "name": "ground floor", "z": 0.0, "state": "designed" },
    { "id": "1", "name": "first floor", "z": 5.2, "state": "designed" },
    { "id": "2", "name": "second floor", "z": 10.4, "state": "designed" },
    { "id": "3", "name": "third floor", "z": 15.6, "state": "designed" },
    { "id": "4", "name": "fourth floor", "z": 20.8, "state": "designed" },
    { "id": "5", "name": "fifth floor", "z": 26.0, "state": "designed" },
    { "id": "6", "name": "sixth floor", "z": 31.2, "state": "designed" },
    { "id": "7", "name": "seventh floor", "z": 36.4, "state": "designed" },
    { "id": "tower-1", "name": "Gryffindor Tower, the boys' stair's first dormitory level (the girls' drum alike)", "z": 43.8, "state": "proposed" },
    { "id": "tower-2", "name": "Gryffindor Tower, the boys' stair's second dormitory level (the girls' drum alike)", "z": 47.2, "state": "proposed" },
    { "id": "tower-3", "name": "Gryffindor Tower, the boys' stair's third dormitory level (the girls' drum alike)", "z": 50.6, "state": "proposed" },
    { "id": "tower-4", "name": "Gryffindor Tower, the boys' stair's fourth dormitory level (the girls' drum alike)", "z": 54.0, "state": "proposed" },
    { "id": "tower-5", "name": "Gryffindor Tower, the boys' stair's fifth dormitory level (the girls' drum alike)", "z": 57.4, "state": "proposed" },
    { "id": "tower-6", "name": "Gryffindor Tower, the boys' stair's sixth dormitory level (the girls' drum alike)", "z": 60.8, "state": "proposed" },
    { "id": "tower", "name": "Gryffindor Tower's top: Harry's year's dormitory, the seventh up the boys' stair", "z": 64.2, "state": "designed", "about": "Godric's 235.1 (13 October 2026, 12.18 pm; req 235, sheet architect-req235-0935): the tower's levels are its own, apart from the ranges' storeys: the common room 7.0 m high on the seventh floor, then seven dormitories a stair at 3.4 m storeys (3.0 clear), the built room at the top, 27.8 m above the common room (CoS 5, GoF 12)" }
  ],
  "rooms": [
    {
      "id": "common-room", "name": "Gryffindor common room", "group": "gryffindor-suite", "level": "7",
      "shape": { "circle": [0, 0], "r": 5.6 }, "wall": 0.8, "floor": 0, "ceiling": 7.0,
      "page": "common-room.html", "frame": { "x": 0, "y": 0, "turn": -48.7, "z": 0 },
      "state": "built", "cite": "PS 7, PS 9"
    },
    {
      "id": "dormitory", "name": "Harry's year's dormitory, at the top of the boys' stair (FIRST YEARS on its door, then SECOND YEARS)", "group": "gryffindor-suite", "level": "tower",
      "shape": { "circle": [0, 0], "r": 5.6 }, "wall": 0.8, "floor": 27.8, "ceiling": 32.3,
      "page": "dormitory.html", "frame": { "x": 0, "y": 0, "turn": -48.7, "z": 27.8 },
      "state": "built", "cite": "PS 7, CoS 5, GoF 12"
    },
    {
      "id": "corridor", "name": "the Fat Lady's corridor", "group": "gryffindor-suite", "level": "7",
      "shape": { "rect": [-1.5, 6.41, 1.5, 25.81] }, "walls": { "west": 0.3, "east": 0.45, "north": 0.3 },
      "floor": 0, "ceiling": 4.5,
      "page": "corridor.html", "frame": { "x": -2.31, "y": 8.71, "turn": -90, "z": 0 },
      "state": "built", "cite": "PS 7"
    },
    {
      "id": "inglenook", "name": "the inglenook, where visitors wait", "group": "gryffindor-suite", "level": "7",
      "shape": { "rect": [-3.7, 15.11, -1.5, 19.51] }, "floor": 0, "ceiling": 2.4,
      "state": "built", "cite": ""
    },
    {
      "id": "corridor-cupboard", "name": "the broom cupboard on her corridor, locked, the old broom inside", "group": "gryffindor-suite", "level": "7",
      "shape": { "rect": [-2.7, 13.66, -1.8, 14.86] }, "floor": 0, "ceiling": 2.4,
      "about": "Godric's 1 on corridor-cupboard-place-1013 (13 October 2026, 6.55 pm; req 281, Magic's B18; the Architect's ledger, line 2): behind her long wall just before the fireside nook, past the second portrait; 1.2 m along the wall by 0.9 deep behind its 0.3 m wall, its door at its nook end, 0.25 m of wall left between it and the nook",
      "state": "designed", "cite": ""
    },
    {
      "id": "study", "name": "Clementine's study, a turret corbelled out from the tower", "group": "gryffindor-suite", "level": "7",
      "shape": { "circle": [-3.27, 5.55], "r": 2.2, "clip": { "x_max": -1.8 } }, "wall": 0.35, "floor": 0, "ceiling": 3.0,
      "state": "designed", "cite": ""
    },
    {
      "id": "lost-things", "name": "the room of lost things, behind the polite door", "group": "gryffindor-suite", "level": "7",
      "shape": { "rect": [-5.21, 8.16, -1.8, 9.26] }, "magic": "bigger inside", "floor": 0,
      "state": "designed", "cite": ""
    },
    {
      "id": "den", "name": "the den, behind the little door", "group": "gryffindor-suite", "level": "7",
      "shape": { "circle": [6.5, -6.0], "r": 2.25 }, "magic": "bigger inside; drawn where its door looks", "floor": 0, "ceiling": 3.6,
      "page": "common-room.html", "state": "built", "cite": ""
    },
    {
      "id": "room-of-requirement", "name": "the Room of Requirement, on its own corridor in the north range", "level": "7",
      "shape": { "rect": [29.65, 46.6, 34.35, 50.0] }, "magic": "there when needed; behind the blank stretch, over the courtyard's air",
      "state": "designed", "cite": "OotP 18, HBP 21, HBP 24; Godric's Q48b, option 3 (12 October 2026, 6.48 pm)"
    },
    {
      "id": "room-corridor", "name": "the Room's corridor, along the north range's courtyard face", "level": "7",
      "shape": { "rect": [16, 50.6, 68, 53.6] }, "walls": { "south": 0.6, "north": 0.4 },
      "about": "3.0 m wide as hers, from the west range to the stair hall's north landing (the top of the last staircase); windows on the courtyard; about 110 m' walk from her portrait",
      "state": "designed", "cite": "OotP 18; Godric's Q48b, option 3 (12 October 2026, 6.48 pm)"
    },
    {
      "id": "dumbledores-office", "name": "Dumbledore's office, circular, at the top of his tower", "level": "T",
      "shape": { "circle": [166, 40], "r": 4.5 }, "z": 43.0, "ceiling": 49.0, "map": "PoA 10: pacing his study",
      "about": "z and ceiling in the castle's frame; circular, so a tower (CoS 11, OotP 22); which tower is ours, by the gargoyle of HBP 25",
      "state": "inferred", "cite": "CoS 11, CoS 12, PoA 10"
    },
    {
      "id": "second-floor-corridor", "name": "the second floor's corridor, from the stair hall west along the court", "level": "2",
      "shape": { "rect": [16, 14.5, 68, 17.5] }, "map": "PoA 10: Mrs Norris prowling the second floor",
      "about": "the books give the floor only; 3.0 m wide, along the south range's courtyard face to the west range",
      "state": "proposed", "cite": "PoA 10"
    },
    {
      "id": "trophy-room", "name": "the trophy room", "level": "3",
      "shape": { "rect": [0, 24, 16, 44] }, "map": "PoA 10: Peeves bouncing around the trophy room",
      "about": "its floor from the books, its spot in the west range ours (the spaces list, 24)",
      "state": "books", "cite": "PS 9, PoA 10"
    },
    {
      "id": "entrance-hall", "name": "the Entrance Hall", "level": "G",
      "shape": { "rect": [68, 50, 92, 70] }, "floor": 0, "ceiling": 10.4, "map": "the front doors, the marble staircase",
      "about": "the layout PDF's 8: 24 by 20 m ours, in the north range under the Astronomy Tower; so big the Dursleys' house would fit in it, stone walls lit by torches, a flagged floor, its ceiling too high to make out (PS 7); rises through two storeys and opens south into the stair hall's well (Godric's 3.1); a balcony overhead (DH 32), not yet placed",
      "state": "books", "cite": "PS 7, CoS 5, HBP 8, DH 32"
    },
    {
      "id": "great-hall", "name": "the Great Hall", "level": "G",
      "shape": { "rect": [15, 51.5, 65, 69.5] }, "map": "the meals",
      "about": "through a doorway to the right on entering (PS 7); 50 by 18 m ours; rises through two storeys",
      "state": "books", "cite": "PS 7, OotP 11"
    },
    {
      "id": "filchs-office", "name": "Filch's office", "level": "G",
      "shape": { "rect": [104, 62, 118, 70] }, "map": "his rounds start and end here",
      "about": "Harry follows him \"back downstairs\" (CoS 8); the ground floor and the north range ours",
      "state": "inferred", "cite": "CoS 8"
    },
    {
      "id": "mcgonagalls-office", "name": "Professor McGonagall's study", "level": "1",
      "shape": { "rect": [146, 52, 158, 60] }, "map": "a teacher's dot",
      "about": "\"Professor McGonagall's study on the first floor\" (PS 15); its spot beside her classroom ours",
      "state": "books", "cite": "PS 15"
    },
    {
      "id": "dungeon-corridor", "name": "the dungeon corridors", "level": "B",
      "shape": { "rect": [16, 3, 120, 15] }, "map": "B14 t2: the dot on the dungeon corridor is Snape",
      "about": "the dungeons under the south ranges, Potions and the deathday party's corridors (CoS 8); the spot ours",
      "state": "books", "cite": "CoS 8"
    },
    {
      "id": "witch-landing", "name": "the one-eyed witch's landing, near the marble staircase", "level": "3",
      "shape": { "rect": [60, 31, 68, 34] }, "map": "the passage to Honeydukes behind her hump",
      "about": "8 by 3 m (req 178, B8); the spot inferred, the spaces list's 26; the Architect's step 3 recommends it directly beneath the corridor page's landing run (site x 68 to 76, y 0.45 to 3.45), waiting on Godric's marks",
      "state": "inferred", "cite": "PoA 10, PoA 14"
    }
  ],
  "openings": [
    { "id": "portrait-hole", "kind": "round hole behind the Fat Lady", "between": ["corridor", "common-room"],
      "at": [0, 6.41], "facing": 0, "r": 0.6, "z": 1.2, "depth": 0.81, "state": "built", "cite": "PS 7" },
    { "id": "polite-door", "kind": "door", "between": ["corridor", "lost-things"], "at": [-1.5, 8.71], "w": 1.0, "h": 2.2,
      "state": "built", "cite": "" },
    { "id": "nook-mouth", "kind": "open mouth", "between": ["corridor", "inglenook"], "span": [[-1.5, 15.11], [-1.5, 19.51]],
      "h": 2.4, "state": "built", "cite": "" },
    { "id": "corridor-window-1", "kind": "window", "room": "corridor", "at": [1.95, 11.21], "w": 1.2, "sill": 0.9, "h": 2.4,
      "view": "the grounds", "state": "built", "cite": "" },
    { "id": "corridor-window-2", "kind": "window", "room": "corridor", "at": [1.95, 13.31], "w": 1.2, "sill": 0.9, "h": 2.4,
      "state": "built", "cite": "" },
    { "id": "cupboard-door", "kind": "door, narrow, plain and locked", "between": ["corridor", "corridor-cupboard"], "at": [-1.5, 14.46], "w": 0.8, "h": 2.0,
      "state": "designed", "about": "the corridor page's x -5.75 on her wall: 0.25 m clear of the second portrait's frame (x -5.1) and of the nook's mouth (x -6.4); Godric's 1 on corridor-cupboard-place-1013 (13 October 2026, 6.55 pm; ledger line 2)",
      "cite": "" },
    { "id": "landing-window", "kind": "window", "room": "corridor", "at": [1.95, 24.61], "w": 2.33, "sill": -1.08, "h": 4.8,
      "view": "the lake", "state": "designed",
      "about": "the lion window, Gryffindor's lion in scarlet and gold glass (req 29; the drawing's shape, 2.33 by 4.8 m), moved from the landing's far end to its south side wall, the castle's south face, centred on the landing (Godric's 1 on corridor-landing-end-1013, 13 October 2026, 6.55 pm; ledger line 1). Its sill 0.9 m above the landing's floor, which is 1.98 m below the corridor's (so -1.08 in the corridor's heights, +35.32 in the castle's); the landing's floor is 2.40 m long, 3.5 cm more than the window, and the outer wall runs on west along the flight and east along the bay, so its jambs stand in whole wall",
      "cite": "" },
    { "id": "common-room-window-left", "kind": "window, a seat in a splayed reveal", "room": "common-room",
      "bearing": 17.2, "w": 1.2, "sill": 1.95, "h": 2.7, "cant": 6.9, "state": "built", "cite": "" },
    { "id": "common-room-window-right", "kind": "window, a seat in a splayed reveal", "room": "common-room",
      "bearing": 80.2, "w": 1.2, "sill": 1.95, "h": 2.7, "cant": -6.9, "state": "built", "cite": "" },
    { "id": "bookcase", "kind": "swinging bookcase", "between": ["common-room", "study"], "bearing": -31.3, "w": 1.2,
      "h": 3.4, "state": "built", "cite": "" },
    { "id": "little-door", "kind": "little door with a big lock", "between": ["common-room", "den"], "bearing": 132.7,
      "w": 0.7, "h": 1.1, "state": "built", "cite": "" },
    { "id": "dorm-W1", "kind": "window", "room": "dormitory", "bearing": 10.2, "w": 0.6, "sill": 1.1, "h": 1.9,
      "view": "Hagrid's hut, the forest edge", "state": "built", "cite": "" },
    { "id": "dorm-W2", "kind": "window", "room": "dormitory", "bearing": -18.8, "w": 0.6, "sill": 1.1, "h": 1.9,
      "view": "the lake, the mountains", "state": "built", "cite": "" },
    { "id": "dorm-W3", "kind": "window", "room": "dormitory", "bearing": 87.2, "w": 0.6, "sill": 1.1, "h": 1.9,
      "view": "the lawn, the castle's shadow", "state": "built", "cite": "PoA 15" },
    { "id": "front-doors", "kind": "the great oak front doors, two leaves", "between": ["entrance-hall", "grounds"], "at": [80, 70],
      "w": 4.0, "h": 6.0, "state": "books", "about": "at the top of a flight of stone steps, facing the marble staircase; their size ours",
      "cite": "PS 6, PS 7, CoS 15, GoF 12" },
    { "id": "great-hall-doors", "kind": "double doors", "between": ["entrance-hall", "great-hall"], "at": [68, 60.5], "w": 3.2, "h": 5.0,
      "state": "books", "about": "to the right on entering, on the hall's axis; their size ours", "cite": "PS 7, OotP 33" },
    { "id": "well-mouth", "kind": "open mouth", "between": ["entrance-hall", "stair hall"], "span": [[72.5, 50], [87.5, 50]], "h": 10.4,
      "state": "designed", "about": "the Entrance Hall opens into the stair hall's well, the marble staircase facing the front doors (Godric's 3.1)",
      "cite": "PS 7" },
    { "id": "kitchens-door", "kind": "door, stone steps down beyond", "between": ["entrance-hall", "hufflepuff-basement"], "at": [70.3, 50],
      "w": 1.4, "h": 2.6, "state": "books", "about": "to the right of the marble staircase, the steps down to the torch-lit basement corridor of the kitchens and Hufflepuff; its size ours",
      "cite": "GoF 17, GoF 21, OotP 18" },
    { "id": "dungeon-stair", "kind": "archway down, a narrow stone stair", "between": ["entrance-hall", "dungeon-corridor"], "at": [89.7, 50],
      "w": 1.4, "h": 2.6, "state": "proposed", "about": "the books give the stair, not its side; the left of the marble staircase ours, the kitchens' door's mirror",
      "cite": "CoS 5, OotP 26" },
    { "id": "chamber-door", "kind": "door", "between": ["entrance-hall", "waiting-chamber"], "at": [92, 66.0], "w": 1.4, "h": 2.6,
      "state": "inferred", "about": "the small empty chamber off the hall where the first years wait: they go back across the hall to the Great Hall's doors, so the left on entering (inferred)",
      "cite": "PS 7, PoA 16, OotP 31" },
    { "id": "classrooms-mouth", "kind": "archway", "between": ["entrance-hall", "classroom-corridor"], "at": [92, 59.0], "w": 3.0, "h": 4.0,
      "state": "books", "about": "the corridor of classrooms opposite the Great Hall's doors, classroom eleven's (the layout PDF's 12); its width ours",
      "cite": "OotP 27" },
    { "id": "corridor-mouth", "kind": "open mouth, the Fat Lady's corridor's full section", "between": ["stair hall", "corridor"],
      "span": [[68, 0.45], [68, 3.45]], "sill": 34.42, "h": 6.48, "state": "designed",
      "about": "the landing bay at +34.42 (the sixth moving flight's head) runs on west through the stair hall's wall into the corridor's landing (corridor-landing, x 65.6 to 68 in the castle's frame), the corridor's 3.0 m width and its ceiling (40.9) kept; corridor.html takes ?from=stair-hall. The landing's far end stands open to the bay, no end wall, the lion window moved to the landing's south side wall (landing-window; Godric's 1 on corridor-landing-end-1013, 13 October 2026, 6.55 pm; ledger line 1)",
      "cite": "PS 7, OotP 32; Godric's 12.1 (13 October 2026, 4.57 pm)" }
  ],
  "features": [
    { "id": "hearth", "room": "common-room", "kind": "fireplace", "bearing": 48.7, "w": 3.0, "h": 2.5, "proud": 0.6, "state": "built" },
    { "id": "fat-lady", "room": "corridor", "kind": "portrait", "at": [0, 6.41], "w": 1.4, "h": 1.7, "state": "built", "cite": "PS 7" },
    { "id": "blank-stretch", "kind": "blank wall, the Room's door when needed", "between": ["room-corridor", "room-of-requirement"],
      "span": [[29.65, 50.6], [34.35, 50.6]], "state": "designed", "cite": "OotP 18" },
    { "id": "barnabas", "room": "room-corridor", "kind": "tapestry, Barnabas the Barmy teaching trolls ballet, opposite the blank stretch",
      "span": [[30.0, 53.6], [34.0, 53.6]], "w": 4.0, "h": 1.8, "state": "designed", "cite": "OotP 18, HBP 20, HBP 21" },
    { "id": "vase", "room": "room-corridor", "kind": "man-sized vase, east of the blank stretch", "at": [35.1, 51.05],
      "state": "designed", "cite": "OotP 18" },
    { "id": "window-just-beyond", "kind": "window", "room": "room-corridor", "at": [28.9, 50.3], "w": 1.2,
      "view": "the west courtyard", "state": "designed", "cite": "OotP 18 (its wall left open by the book)" },
    {"id": "hourglass-niche-gryffindor", "room": "entrance-hall", "kind": "round-headed niche, the Gryffindor hourglass", "at": [68, 51.93], "w": 1.2, "h": 2.45, "depth": 0.5, "sill": 0, "state": "designed", "about": "Godric's 13.1 (13 October 2026, 5.09 pm; sheet architect-niches-1013-1701): four niches in a row on the west wall south of the Great Hall's doors, nearest the marble staircase's foot, one glass a house in the Sorting Hat's order from the south, 1.68 m apart (Design's PITCH), the foot on the flags; the glasses Design's LumosHourglass.hall()", "cite": "OotP 28, OotP 38, DH 32, PS 15; Godric's 13.1 (13 October 2026, 5.09 pm)"},
    {"id": "hourglass-niche-hufflepuff", "room": "entrance-hall", "kind": "round-headed niche, the Hufflepuff hourglass", "at": [68, 53.61], "w": 1.2, "h": 2.45, "depth": 0.5, "sill": 0, "state": "designed", "cite": "OotP 28, OotP 38, DH 32, PS 15; Godric's 13.1 (13 October 2026, 5.09 pm)"},
    {"id": "hourglass-niche-ravenclaw", "room": "entrance-hall", "kind": "round-headed niche, the Ravenclaw hourglass", "at": [68, 55.29], "w": 1.2, "h": 2.45, "depth": 0.5, "sill": 0, "state": "designed", "cite": "OotP 28, OotP 38, DH 32, PS 15; Godric's 13.1 (13 October 2026, 5.09 pm)"},
    {"id": "hourglass-niche-slytherin", "room": "entrance-hall", "kind": "round-headed niche, the Slytherin hourglass", "at": [68, 56.97], "w": 1.2, "h": 2.45, "depth": 0.5, "sill": 0, "state": "designed", "cite": "OotP 28, OotP 38, DH 32, PS 15; Godric's 13.1 (13 October 2026, 5.09 pm)"}
  ],
  "stairs": [
    { "id": "tower-stair", "kind": "open newel stair", "rooms": ["common-room", "dormitory"], "newel": [4.13, -2.59], "r": 0.7,
      "from": 0, "to": 27.8, "treads": 139, "rise": 0.2, "hand": "clockwise up, seen from above", "state": "built", "cite": "PS 7",
      "drawn_to": 5.6, "drawn_treads": 28,
      "about": "Godric's Q68, 68.1 (12 October 2026, 6.51 pm; req 191, 201): the common room draws 28, since no view shows it above 5.37 m. Godric's 235.1 (13 October 2026, 12.18 pm; req 235, sheet architect-req235-0935): the stair climbs on unseen past six doors, a room a level (PoA 13, \"Doors opened behind them\"), walled in below the top, to the built room's floor at 27.8 m; the dormitory page's open stair head is the top's" },
    { "id": "corridor-flight", "kind": "straight flight down", "room": "corridor", "span": [[-1.5, 20.11], [1.5, 23.41]],
      "from": 0, "to": -1.98, "treads": 11, "rise": 0.18, "state": "built" },
    { "id": "corridor-landing", "kind": "landing, one of the moving stair's places", "room": "corridor",
      "shape": { "rect": [-1.5, 23.41, 1.5, 25.81] }, "z": -1.98, "state": "built" },
    { "id": "marble-staircase", "kind": "magnificent marble staircase, facing the front doors: its first flight and half-landing (the well's M1)",
      "rooms": ["stair hall"], "span": [[73, 50], [87, 45.2]], "up": [0, -1], "from": 0, "to": 2.6, "treads": 15, "rise": 0.173,
      "landing": [70.4, 43, 89.6, 45.2], "state": "designed",
      "about": "the layout PDF's 9 ([73, 43, 87, 50]): 14 m wide, rising south from the Entrance Hall into the well, fifteen treads of 0.32 m to a half-landing at 2.6 m. Godric's 12.1 (13 October 2026, 4.57 pm; sheet architect-well-1013-1653): the half-landing widened to the strips (x 70.4 to 89.6), the stair dividing there into two flights rising south to the first-floor galleries (well-M1w, well-M1e), then one flight a floor up the east strip (well-M2 to well-M7), the six moving flights up the west (well-S1 to well-S6, the sixth to the Fat Lady's landing bay at +34.42), galleries along both long walls and a landing at each end on every floor; the entries well-* below, from tools/architect-well-sheet.py by tools/architect-well-model.py",
      "cite": "PS 7, PoA 14, PS 8, OotP 32; Godric's 12.1 (13 October 2026, 4.57 pm)" },
    {"id": "well-1-south-landing", "kind": "landing", "rooms": ["stair hall"], "shape": {"rect": [68, 0, 92, 3.6]}, "z": 5.2, "state": "designed"},
    {"id": "well-1-north-landing-w", "kind": "landing", "rooms": ["stair hall"], "shape": {"rect": [68, 46.4, 73.4, 50]}, "z": 5.2, "state": "designed"},
    {"id": "well-1-north-landing-e", "kind": "landing", "rooms": ["stair hall"], "shape": {"rect": [86.6, 46.4, 92, 50]}, "z": 5.2, "state": "designed"},
    {"id": "well-1-west-gallery", "kind": "gallery", "rooms": ["stair hall"], "shape": {"rect": [68, 3.6, 70.4, 46.4]}, "z": 5.2, "state": "designed"},
    {"id": "well-1-east-gallery", "kind": "gallery", "rooms": ["stair hall"], "shape": {"rect": [89.6, 3.6, 92, 46.4]}, "z": 5.2, "state": "designed"},
    {"id": "well-2-south-landing", "kind": "landing", "rooms": ["stair hall"], "shape": {"rect": [68, 0, 92, 3.6]}, "z": 10.4, "state": "designed"},
    {"id": "well-2-north-landing", "kind": "landing", "rooms": ["stair hall"], "shape": {"rect": [68, 46.4, 92, 50]}, "z": 10.4, "state": "designed"},
    {"id": "well-2-west-gallery", "kind": "gallery", "rooms": ["stair hall"], "shape": {"rect": [68, 3.6, 70.4, 46.4]}, "z": 10.4, "state": "designed"},
    {"id": "well-2-east-gallery", "kind": "gallery", "rooms": ["stair hall"], "shape": {"rect": [89.6, 3.6, 92, 46.4]}, "z": 10.4, "state": "designed"},
    {"id": "well-3-south-landing", "kind": "landing", "rooms": ["stair hall"], "shape": {"rect": [68, 0, 92, 3.6]}, "z": 15.6, "state": "designed"},
    {"id": "well-3-north-landing", "kind": "landing", "rooms": ["stair hall"], "shape": {"rect": [68, 46.4, 92, 50]}, "z": 15.6, "state": "designed"},
    {"id": "well-3-west-gallery", "kind": "gallery", "rooms": ["stair hall"], "shape": {"rect": [68, 3.6, 70.4, 46.4]}, "z": 15.6, "state": "designed"},
    {"id": "well-3-east-gallery", "kind": "gallery", "rooms": ["stair hall"], "shape": {"rect": [89.6, 3.6, 92, 46.4]}, "z": 15.6, "state": "designed"},
    {"id": "well-4-south-landing", "kind": "landing", "rooms": ["stair hall"], "shape": {"rect": [68, 0, 92, 3.6]}, "z": 20.8, "state": "designed"},
    {"id": "well-4-north-landing", "kind": "landing", "rooms": ["stair hall"], "shape": {"rect": [68, 46.4, 92, 50]}, "z": 20.8, "state": "designed"},
    {"id": "well-4-west-gallery", "kind": "gallery", "rooms": ["stair hall"], "shape": {"rect": [68, 3.6, 70.4, 46.4]}, "z": 20.8, "state": "designed"},
    {"id": "well-4-east-gallery", "kind": "gallery", "rooms": ["stair hall"], "shape": {"rect": [89.6, 3.6, 92, 46.4]}, "z": 20.8, "state": "designed"},
    {"id": "well-5-south-landing", "kind": "landing", "rooms": ["stair hall"], "shape": {"rect": [68, 0, 92, 3.6]}, "z": 26.0, "state": "designed"},
    {"id": "well-5-north-landing", "kind": "landing", "rooms": ["stair hall"], "shape": {"rect": [68, 46.4, 92, 50]}, "z": 26.0, "state": "designed"},
    {"id": "well-5-west-gallery", "kind": "gallery", "rooms": ["stair hall"], "shape": {"rect": [68, 3.6, 70.4, 46.4]}, "z": 26.0, "state": "designed"},
    {"id": "well-5-east-gallery", "kind": "gallery", "rooms": ["stair hall"], "shape": {"rect": [89.6, 3.6, 92, 46.4]}, "z": 26.0, "state": "designed"},
    {"id": "well-6-south-landing", "kind": "landing", "rooms": ["stair hall"], "shape": {"rect": [68, 0, 92, 3.6]}, "z": 31.2, "state": "designed"},
    {"id": "well-6-north-landing", "kind": "landing", "rooms": ["stair hall"], "shape": {"rect": [68, 46.4, 92, 50]}, "z": 31.2, "state": "designed"},
    {"id": "well-6-west-gallery", "kind": "gallery", "rooms": ["stair hall"], "shape": {"rect": [68, 3.6, 70.4, 46.4]}, "z": 31.2, "state": "designed"},
    {"id": "well-6-east-gallery", "kind": "gallery", "rooms": ["stair hall"], "shape": {"rect": [89.6, 3.6, 92, 46.4]}, "z": 31.2, "state": "designed"},
    {"id": "well-7-south-landing", "kind": "landing", "rooms": ["stair hall"], "shape": {"rect": [76.0, 0, 92, 3.6]}, "z": 36.4, "state": "designed"},
    {"id": "well-bay", "kind": "landing bay, the sixth moving flight's head", "rooms": ["stair hall"], "shape": {"rect": [68, 0, 76.0, 3.6]}, "z": 34.42, "state": "designed"},
    {"id": "well-7-north-landing", "kind": "landing", "rooms": ["stair hall"], "shape": {"rect": [68, 46.4, 92, 50]}, "z": 36.4, "state": "designed"},
    {"id": "well-7-west-gallery", "kind": "gallery", "rooms": ["stair hall"], "shape": {"rect": [68, 3.6, 70.4, 46.4]}, "z": 36.4, "state": "designed"},
    {"id": "well-7-east-gallery", "kind": "gallery", "rooms": ["stair hall"], "shape": {"rect": [89.6, 3.6, 92, 46.4]}, "z": 36.4, "state": "designed"},
    {"id": "well-M1w", "kind": "marble staircase, fixed", "rooms": ["stair hall"], "span": [[70.4, 43], [73.4, 38.2]], "up": [0, -1], "from": 2.6, "to": 5.2, "treads": 15, "rise": 0.173, "state": "designed"},
    {"id": "well-M1e", "kind": "marble staircase, fixed", "rooms": ["stair hall"], "span": [[86.6, 43], [89.6, 38.2]], "up": [0, -1], "from": 2.6, "to": 5.2, "treads": 15, "rise": 0.173, "state": "designed"},
    {"id": "well-M2", "kind": "marble staircase, fixed", "rooms": ["stair hall"], "span": [[86.6, 46.4], [89.6, 37.4]], "up": [0, -1], "from": 5.2, "to": 10.4, "treads": 30, "rise": 0.173, "state": "designed"},
    {"id": "well-S1", "kind": "moving staircase", "rooms": ["stair hall"], "span": [[70.4, 46.4], [73.4, 37.4]], "up": [0, -1], "from": 5.2, "to": 10.4, "treads": 30, "rise": 0.173, "state": "designed"},
    {"id": "well-M3", "kind": "marble staircase, fixed", "rooms": ["stair hall"], "span": [[86.6, 3.6], [89.6, 12.6]], "up": [0, 1], "from": 10.4, "to": 15.6, "treads": 30, "rise": 0.173, "state": "designed"},
    {"id": "well-S2", "kind": "moving staircase", "rooms": ["stair hall"], "span": [[70.4, 3.6], [73.4, 12.6]], "up": [0, 1], "from": 10.4, "to": 15.6, "treads": 30, "rise": 0.173, "state": "designed"},
    {"id": "well-M4", "kind": "marble staircase, fixed", "rooms": ["stair hall"], "span": [[86.6, 46.4], [89.6, 37.4]], "up": [0, -1], "from": 15.6, "to": 20.8, "treads": 30, "rise": 0.173, "state": "designed"},
    {"id": "well-S3", "kind": "moving staircase", "rooms": ["stair hall"], "span": [[70.4, 46.4], [73.4, 37.4]], "up": [0, -1], "from": 15.6, "to": 20.8, "treads": 30, "rise": 0.173, "state": "designed"},
    {"id": "well-M5", "kind": "marble staircase, fixed", "rooms": ["stair hall"], "span": [[86.6, 3.6], [89.6, 12.6]], "up": [0, 1], "from": 20.8, "to": 26.0, "treads": 30, "rise": 0.173, "state": "designed"},
    {"id": "well-S4", "kind": "moving staircase", "rooms": ["stair hall"], "span": [[70.4, 3.6], [73.4, 12.6]], "up": [0, 1], "from": 20.8, "to": 26.0, "treads": 30, "rise": 0.173, "state": "designed"},
    {"id": "well-M6", "kind": "marble staircase, fixed", "rooms": ["stair hall"], "span": [[86.6, 46.4], [89.6, 37.4]], "up": [0, -1], "from": 26.0, "to": 31.2, "treads": 30, "rise": 0.173, "state": "designed"},
    {"id": "well-S5", "kind": "moving staircase", "rooms": ["stair hall"], "span": [[70.4, 46.4], [73.4, 37.4]], "up": [0, -1], "from": 26.0, "to": 31.2, "treads": 30, "rise": 0.173, "state": "designed"},
    {"id": "well-M7", "kind": "marble staircase, fixed", "rooms": ["stair hall"], "span": [[86.6, 3.6], [89.6, 12.6]], "up": [0, 1], "from": 31.2, "to": 36.4, "treads": 30, "rise": 0.173, "state": "designed"},
    {"id": "well-S6", "kind": "moving staircase", "rooms": ["stair hall"], "span": [[70.4, 9.0], [73.4, 3.6]], "up": [0, -1], "from": 31.2, "to": 34.42, "treads": 19, "rise": 0.169, "state": "designed"}
  ],
  "dormitories": {
    "state": "proposed",
    "cite": "PS 7, CoS 5, PoA 13, GoF 12, OotP 17, OotP 18, HBP 21, CoS 12, DH 23, DH 29",
    "about": "Godric's 235.1 (13 October 2026, 12.18 pm; req 235, sheet architect-req235-0935): each house a room per year group, the boys' and the girls' on their own stairs; a year group keeps its room all seven years, the sign on its door changing each September (CoS 5), so Harry's year's is at the top of the boys' stair. His note: \"We will keep the other years very basic.\" Heights in the castle's frame; all proposed but the built room.",
    "houses": [
      {
        "house": "Gryffindor",
        "tower": "Gryffindor Tower",
        "girls_tower": "Gryffindor girls' tower",
        "levels": [
          43.8,
          47.2,
          50.6,
          54.0,
          57.4,
          60.8,
          64.2
        ],
        "clear": 3.0,
        "top_clear": 4.5,
        "built": "dormitory",
        "about": "the boys' seven up the built tower's stair, the built room the seventh; the girls' seven up their own drum, entered from the common room through the shared wall (OotP 17's slide is theirs); each stair walled in below the top, a door a room (PoA 13)"
      },
      {
        "house": "Ravenclaw",
        "tower": "Ravenclaw Tower",
        "common_room": [
          36.4,
          42.6
        ],
        "levels": [
          43.0,
          46.4,
          49.8,
          53.2,
          56.6,
          60.0,
          63.4
        ],
        "clear": 3.0,
        "about": "the common room lowered to the seventh floor; the drum split, a boys' and a girls' half a level, each up its own stair turret from a lobby behind the one door (DH 29: \"a door that led, he guessed, to dormitories above\")"
      },
      {
        "house": "Hufflepuff",
        "about": "below ground near the kitchens (HBP 21, OotP 18): two passages off the common room's level, a boys' and a girls', seven doors each; the common room not yet placed"
      },
      {
        "house": "Slytherin",
        "about": "a long, low underground room (CoS 12) under the lake (DH 23): two passages off it, a boys' and a girls', seven doors each; the common room not yet placed"
      }
    ]
  },
  "staircases": {
    "count": 142, "state": "proposed", "cite": "PS 8",
    "about": "PS 8's hundred and forty-two through the whole castle, one staircase one stair from a floor to the next landing: the well holds 14 (the marble staircase, the moving flights, the Friday one), the rest stand in the towers, the ranges, the walls and down (Godric's 7.18 am question, 13 October 2026; tools/architect-stairs.py, sheet architect-stairs-0735). In the castle's frame; 'ours' where no book places it.",
    "places": [
      { "kind": "well", "at": [84, 30], "name": "the marble staircase", "count": 7, "cite": "PS 7, HBP 24" },
      { "kind": "well", "at": [76, 22], "name": "the moving flights", "count": 6, "cite": "OotP 32" },
      { "kind": "odd", "at": [76, 40], "name": "the Friday staircase", "count": 1, "cite": "PS 8" },
      { "kind": "spiral", "at": [161.8, 33.4], "name": "the head's", "count": 1, "cite": "CoS 11" },
      { "kind": "spiral", "at": [-2, 42.8], "name": "Ravenclaw", "count": 9, "cite": "DH 29" },
      { "kind": "spiral", "at": [86.6, 82], "name": "Astronomy", "count": 9, "cite": "PS 14" },
      { "kind": "spiral", "at": [162.4, 63.6], "name": "North Tower", "count": 9, "cite": "PoA 6, GoF 13" },
      { "kind": "spiral", "at": [14, 73.6], "name": "West Tower", "count": 9, "cite": "GoF 15" },
      { "kind": "spiral", "at": [34.6, -1.8], "name": "Gryffindor's angle turret", "count": 7, "cite": "ours" },
      { "kind": "spiral", "at": [40.5, 4.5], "name": "Gryffindor's dormitories", "count": 4, "cite": "PS 7, OotP 17" },
      { "kind": "spiral", "at": [93.6, -2.6], "name": "the keep's", "count": 10, "cite": "ours" },
      { "kind": "spiral", "at": [5.4, -5], "name": "the south-west", "count": 4, "cite": "ours" },
      { "kind": "spiral", "at": [134.8, -7], "name": "the lake tower", "count": 3, "cite": "ours" },
      { "kind": "spiral", "at": [15.6, 73.8], "name": "the north-west", "count": 3, "cite": "ours" },
      { "kind": "range", "at": [8, 21], "name": "west range, south", "count": 7, "cite": "ours" },
      { "kind": "range", "at": [8, 47], "name": "west range, north", "count": 7, "cite": "ours" },
      { "kind": "range", "at": [62, 21], "name": "south range, by the keep", "count": 7, "cite": "ours" },
      { "kind": "range", "at": [97, 15], "name": "hall range, by the keep", "count": 7, "cite": "ours" },
      { "kind": "range", "at": [152, 34], "name": "east range", "count": 6, "cite": "ours" },
      { "kind": "range", "at": [100, 61], "name": "north range, east", "count": 7, "cite": "ours" },
      { "kind": "rickety", "at": [26, 12], "name": "the Tudor lodgings", "count": 3, "cite": "ours" },
      { "kind": "rickety", "at": [8, 34], "name": "the gallery storey", "count": 1, "cite": "ours" },
      { "kind": "rickety", "at": [130, 12], "name": "the link of 1647", "count": 2, "cite": "ours" },
      { "kind": "hidden", "at": [60, 12], "name": "the tapestry stair to Gryffindor", "count": 1, "cite": "GoF 12" },
      { "kind": "hidden", "at": [91, 8], "name": "in the keep's east wall", "count": 2, "cite": "ours" },
      { "kind": "hidden", "at": [79, -1], "name": "in the keep's south wall", "count": 1, "cite": "ours" },
      { "kind": "odd", "at": [67, 8], "name": "the vanishing step", "count": 2, "cite": "GoF 25, HBP 28" },
      { "kind": "down", "at": [72, 60], "name": "to the dungeons", "count": 2, "cite": "CoS 5" },
      { "kind": "down", "at": [62, 66], "name": "to the kitchens and Hufflepuff", "count": 2, "cite": "GoF 21, OotP 18" },
      { "kind": "down", "at": [80, 92], "name": "the stone steps", "count": 1, "cite": "PS 6" },
      { "kind": "down", "at": [84, -6], "name": "from the harbour", "count": 2, "cite": "PS 6" }
    ]
  },
  "open": [
    "The tower stair is drawn to 5.6 m in the common room; it climbs on unseen to the top dormitory's floor at 27.8 m (Godric's 235.1).",
    "The 142 staircases (PS 8): the places' tally predates 235.1, which gives Gryffindor's dormitories fourteen (seven a stair, were 4) and Ravenclaw's two stair turrets seven each (were 9 in one); the tally to be settled with Godric (the Architect).",
    "The well as built under 12.1 holds fifteen flights (the marble staircase's first flight, its two divided flights and six more; six moving flights) where the tally's two well places say seven and six; for the tally, with the rest."
  ]
};
