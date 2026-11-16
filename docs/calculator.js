(function () {
  const versionPattern =
    /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|[0-9A-Za-z-]*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|[0-9A-Za-z-]*[A-Za-z-][0-9A-Za-z-]*))*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
  function calculateNextVersion(version, releaseType) {
    if (!['patch', 'minor', 'major'].includes(releaseType)) {
      throw new TypeError('Choose patch, minor, or major.');
    }

    const match = version.trim().match(versionPattern);
    if (!match) {
      throw new TypeError('Enter a semantic version such as 1.2.3.');
    }

    let major = Number(match[1]);
    let minor = Number(match[2]);
    let patch = Number(match[3]);
    const hasPrerelease = Boolean(match[4]);

    if (![major, minor, patch].every(Number.isSafeInteger)) {
      throw new RangeError('Version numbers must not exceed the safe integer limit.');
    }

    if (releaseType === 'patch') {
      if (!hasPrerelease) patch += 1;
    } else if (releaseType === 'minor') {
      if (minor !== 0 || patch !== 0 || !hasPrerelease) minor += 1;
      patch = 0;
    } else {
      if (minor !== 0 || patch !== 0 || !hasPrerelease) major += 1;
      minor = 0;
      patch = 0;
    }

    if (![major, minor, patch].every(Number.isSafeInteger)) {
      throw new RangeError('The resulting version exceeds the safe integer limit.');
    }

    return `${major}.${minor}.${patch}`;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { calculateNextVersion };
  }

  if (typeof document === 'undefined') return;

  const versionInput = document.getElementById('current-version');
  const releaseTypeInput = document.getElementById('release-type');
  const resultOutput = document.getElementById('new-version');
  const message = document.getElementById('version-help');
  const copyButton = document.getElementById('copy-version');

  function updatePreview() {
    try {
      const currentVersion = versionInput.value;
      const releaseType = releaseTypeInput.value;
      const nextVersion = calculateNextVersion(currentVersion, releaseType);

      resultOutput.value = nextVersion;
      resultOutput.textContent = nextVersion;
      message.textContent = `${releaseType[0].toUpperCase()}${releaseType.slice(1)} release: ${currentVersion.trim()} becomes ${nextVersion}.`;
      message.classList.remove('error');
      copyButton.disabled = false;
    } catch (error) {
      resultOutput.value = '';
      resultOutput.textContent = '\u2014';
      message.textContent =
        error instanceof Error ? error.message : 'Unable to calculate the next version.';
      message.classList.add('error');
      copyButton.disabled = true;
    }
  }

  versionInput.addEventListener('input', updatePreview);
  releaseTypeInput.addEventListener('change', updatePreview);
  copyButton.addEventListener('click', async function () {
    try {
      await navigator.clipboard.writeText(resultOutput.value);
      message.textContent = `Copied ${resultOutput.value} to the clipboard.`;
      message.classList.remove('error');
    } catch {
      message.textContent = 'Clipboard access is unavailable. Select and copy the version above.';
      message.classList.remove('error');
    }
  });

  updatePreview();
})();
