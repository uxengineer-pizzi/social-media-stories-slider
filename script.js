class SlideStories {
  constructor(type) {
    this.slide = document.querySelector(`[data-slide="${type}"]`);
    this.active = 0;
    this.timeout = null;
    this.slideDuration = 60000;
    this.init();
  }

  async activeSlide(index) {
    this.active = index;

    // Deactivate all slides
    for (const item of this.items) {
      const video = item.querySelector('.story-video');
      if (video) {
        video.pause();
        video.currentTime = 0;
        video.removeEventListener('timeupdate', this.videoTimeUpdate);
      }
      item.classList.remove('active');
    }

    for (const thumbItem of this.thumbItems) {
      thumbItem.classList.remove('active');
      thumbItem.querySelector('.progress').style.width = '0%';
    }

    const currentItem = this.items[index];
    currentItem.classList.add('active');
    this.thumbItems[index].classList.add('active');

    const currentVideo = currentItem.querySelector('.story-video');
    if (currentVideo) {
      try {
        const videoDuration = currentVideo.duration;
        if (videoDuration > 0) {
          currentVideo.playbackRate = videoDuration / 60;
        }

        await currentVideo.play();

        this.videoTimeUpdate = () => {
          const progressPercent = (currentVideo.currentTime / 60) * 100;
          this.thumbItems[index].querySelector(
            '.progress',
          ).style.width = `${progressPercent}%`;
        };

        currentVideo.addEventListener('timeupdate', this.videoTimeUpdate);
        this.startSlideTimer();
      } catch (err) {
        console.log('Autoplay prevented, using fallback');
        this.startSlideTimer();
      }
    } else {
      this.startSlideTimer();
    }
  }

  startSlideTimer() {
    clearTimeout(this.timeout);
    const startTime = Date.now();
    const updateInterval = 100;

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const progressPercent = Math.min(
        (elapsed / this.slideDuration) * 100,
        100,
      );
      this.thumbItems[this.active].querySelector(
        '.progress',
      ).style.width = `${progressPercent}%`;

      if (elapsed >= this.slideDuration) {
        this.nextSlider();
      } else {
        this.timeout = setTimeout(updateProgress, updateInterval);
      }
    };

    this.timeout = setTimeout(updateProgress, updateInterval);
  }

  prevSlider() {
    this.activeSlide(this.active > 0 ? this.active - 1 : this.items.length - 1);
  }

  nextSlider() {
    this.activeSlide(this.active < this.items.length - 1 ? this.active + 1 : 0);
  }

  addNavigation() {
    const nextBtn = this.slide.querySelector('.slide-next');
    const prevBtn = this.slide.querySelector('.slide-prev');
    nextBtn.addEventListener('click', this.nextSlider);
    prevBtn.addEventListener('click', this.prevSlider);
  }

  addThumbItems() {
    this.thumb.innerHTML = '';
    for (const _ of this.items) {
      const thumbItem = document.createElement('span');
      const progress = document.createElement('span');
      progress.className = 'progress';
      progress.style.width = '0%';
      thumbItem.appendChild(progress);
      this.thumb.appendChild(thumbItem);
    }
    this.thumbItems = Array.from(this.thumb.children);
  }

  init() {
    this.nextSlider = this.nextSlider.bind(this);
    this.prevSlider = this.prevSlider.bind(this);
    this.items = this.slide.querySelectorAll('.slide-items > .slide-item');
    this.thumb = this.slide.querySelector('.slide-thumb');
    this.addThumbItems();
    this.addNavigation();
    this.activeSlide(0);
  }
}

new SlideStories('princess-slider');
