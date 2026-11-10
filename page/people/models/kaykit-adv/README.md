# models/kaykit-adv: the 3D figure mockup's stand-in (req 3349)

One file, CC0.

- `Mage.glb`: KayKit Adventurers Character Pack 1.0 by Kay Lousberg (kaylousberg.com), licence Creative Commons Zero
  (CC0 1.0), as the pack's `LICENSE.txt` states it. Fetched 9 November 2026 from
  `https://raw.githubusercontent.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0/main/addons/kaykit_character_pack_adventures/Characters/gltf/Mage.glb`,
  repo commit `672074b73ba276876a19e8816ecdc5241817ab47`, sha256
  `cf898585da33fab50c724d31605fb931eb2912e6d2280092141e98ca81ad507d`. The pack's itch.io page
  (kaylousberg.itch.io/kaykit-adventurers) also states CC0. Not checked: a link from kaylousberg.com to that GitHub
  account (the site's page carried none we could read).

What is in it: one skinned body on the KayKit rig (root, hips, spine, chest, head, arms, legs, IK helpers), six skinned
meshes (Mage_Body, Mage_Head, Mage_ArmLeft and Right, Mage_LegLeft and Right), rigid pieces on bones (Mage_Hat on the
head, Mage_Cape on the chest, Spellbook and Spellbook_open in the left hand, 1H_Wand and 2H_Staff in the right), one
colour-swatch atlas (8 by 4 cells), and 76 clips, among them Idle, Walking_A, Sit_Chair_Down, Sit_Chair_Idle,
Sit_Chair_StandUp. The mockup hides the hat, the staff, the wand and the closed book, and repaints the atlas flat in
Clementine's colours (`page/people/figure3d-room.js`, CELL).

Untrusted file: nothing in it is executed; three.js's GLTFLoader reads it in the page.

The earlier stand-in (`models/kaykit/`, NoLimitNexus/game-models' body and parts, licence unstated) was removed on
9 November 2026: req 3349 allows CC0 only.

Mage-pupil.glb: the same Mage (CC0, Kay Lousberg), reshaped to a drawn pupil's proportions by tools/figure3d-pupil-blender.py (req 3369, 9 November 2026); CC0 as its source.
