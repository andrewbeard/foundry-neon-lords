# Neon Lords of the Toxic Wasteland system to Foundry VTT

![Foundry v12](https://img.shields.io/badge/foundry-v12-green)

This is a simple system module for [Foundry VTT](https://foundryvtt.com) for the [Neon Lords of the Toxic Wastelands RPG](https://neonlords.com).  It is completely unofficial, but implemented with permission from Brian Shutter, the author. It is based on the [Boilerplate](https://github.com/asacolips-projects/boilerplate) system, and there are many places where its code peeks through in sections that haven't been fully implemented yet.

## Usage

If you just want to start a Neon Lords game in Foundry VTT you're probably in the wrong place. The easy way to install this system is to go into Foundry itself, search for Neon Lords, and install the system from there. Otherwise you can grab a zip file of the system from the releases page.

## Mutations

Mutations are implemented as Items internally (Foundry Items, which are more generic than just pieces of gear). You can roll on the Mutations tables included in the Core Rulez Tables Compendium and the result will be an Item that can be clicked on for additional details and then dragged and dropped onto a character sheet. It should then show up as one of that character's mutations from then on.

## Hairstyles

These are also implemented as Items. You can find all of them in the Items compendium (with images!) and drag the one you want onto your character sheet. Only one may be present for a character at a time, and if a Hairstyle is replaced you'll get a popup message letting you know.

## Fear

The Fear table in Neon Lords is a little more complex than the other tables, as the die you use to roll on it is dependent on your level. There's no way to do that directly in a Rollable Table, so the system includes a macro (creatively named "Fear Roll") that will take the currently selected character's level (or hit dice) into account and roll the correct die size. You can roll on the table directly, but it will always use 1D20 unless you manually change it (which is no fun).

## Roll Modifiers
Right-click on any element on a character sheet that causes a die roll to pop up a dialog allowing you to add additional modifiers. Use this for applying things like range penalties/bonuses, modifiers from previous To The MAX! results, accounting for relevant mutations, or anything else where you need to change a specific roll. 