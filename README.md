# vscode-power-measurement README

This extension gives power usage statistics when debugging programs in VSCode

## Features

Measure power consumption of a process by process id.
Short summary of a measurement including process name, start time, average power usage and maximum power usage.
Display measurement values in a fully integrated graph.
Persistent storage for measurements.
Compare measurements by opening previous measurements side by side.

## Requirements

On the first time use of the extension the root password is requested to change the group of all files named energy_uj in the /sys/devices/virtual/powercap/ folder to the current user group and add reading permissions for the group to these files.

`sudo -S sh -c "chrgrp ${gid} ${files} && chmod g+r ${files}"`

## Known Issues

Currently a user has to manualy select the process to measure, this is due to the lack of support when creating visual studio code extensions to access the processes in the current debug stack.

## Release Notes

### 1.0.0

Initial release of Power measurement tool
