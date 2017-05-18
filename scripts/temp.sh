#!/bin/bash


DELAY=3

while [[ $REPLY != 0 ]]; do
    clear

    read -p "Enter selection [0-3] > "

    if [[ $REPLY =~ ^[0-3]$ ]]; then
	if [[ $REPLY == 1 ]]; then
	    echo "Hostname: $HOSTNAME"
	    uptime
	    sleep $DELAY
	fi
	if [[ $REPLY == 2 ]]; then
	    df -h
	    sleep $DELAY
	fi
	if [[ $REPLY == 3 ]]; then
	    if [[ $(id -u) -eq 0 ]]; then
		echo "Home space util"
		du -sh /home/*
	    else
		echo "home space util ($USER)"
		du -sh $HOME
	    fi
	    sleep $DELAY
	fi
    else
	echo "Invalid entry"
	sleep $DELAY
    fi
done
echo "Program terminated"
