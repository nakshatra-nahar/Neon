from cx_Freeze import setup, Executable
import requests.certs

from version import __version__

options = {
    'build_exe': {
        # Add common dependencies for skills
        'includes': [
            'bs4',
            'requests',
            'timeit'
        ],
        'include_files': [(requests.certs.where(), 'cacert.pem')]
    }
}

executables = [
    Executable(
        script='bridges/python/src/main.py',
        target_name='neon-python-bridge'
    )
]

setup(
    name='neon-python-bridge',
    version=__version__,
    executables=executables,
    options=options
)
