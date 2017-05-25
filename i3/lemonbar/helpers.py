import subprocess


def cleanup(app):
    """Kill all running instances of app"""
    processes = subprocess.check_output('ps -e', shell=True)
    if app in processes.decode():
        pids = subprocess.check_output('pidof ' + app, shell=True)
        subprocess.run(['kill'] + pids.decode().split())
