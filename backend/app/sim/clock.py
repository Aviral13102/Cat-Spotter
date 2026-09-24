import time
import threading
from typing import Callable, List
from datetime import datetime, timedelta

class SimClock:
    def __init__(self, shift_start: str = "08:00"):
        self.shift_start = datetime.strptime(shift_start, "%H:%M")
        self.speed = 60.0  # 1 real sec = 60 sim sec = 1 sim min
        self.is_playing = False
        self._start_time_real = 0.0
        self._elapsed_s_accumulated = 0.0
        self._lock = threading.Lock()
        self._callbacks: List[Callable] = []

    def register_tick_callback(self, cb: Callable):
        with self._lock:
            self._callbacks.append(cb)
            
    def play(self):
        with self._lock:
            if not self.is_playing:
                self.is_playing = True
                self._start_time_real = time.time()
                
    def pause(self):
        with self._lock:
            if self.is_playing:
                self.is_playing = False
                self._elapsed_s_accumulated += (time.time() - self._start_time_real)
                
    def reset(self):
        with self._lock:
            self._elapsed_s_accumulated = 0.0
            if self.is_playing:
                self._start_time_real = time.time()
                
    def set_speed(self, speed: float):
        with self._lock:
            if self.is_playing:
                self._elapsed_s_accumulated += (time.time() - self._start_time_real)
                self._start_time_real = time.time()
            self.speed = speed
            
    @property
    def elapsed_s(self) -> float:
        with self._lock:
            if self.is_playing:
                return self._elapsed_s_accumulated + (time.time() - self._start_time_real)
            return self._elapsed_s_accumulated
            
    @property
    def sim_minutes(self) -> float:
        return (self.elapsed_s * self.speed) / 60.0
        
    @property
    def sim_time(self) -> datetime:
        return self.shift_start + timedelta(minutes=self.sim_minutes)
