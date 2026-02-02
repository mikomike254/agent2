'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Link as LinkIcon, User } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Meeting {
    id: string;
    title: string;
    start_time: string;
    end_time: string;
    meeting_link?: string;
    status: string;
}

export default function MeetingCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMeetings();
    }, []);

    const fetchMeetings = async () => {
        try {
            const res = await fetch('/api/meetings');
            const data = await res.json();
            if (data.success) {
                setMeetings(data.data);
            }
        } catch (error) {
            console.error('Error fetching meetings:', error);
        } finally {
            setLoading(false);
        }
    };

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const isToday = (day: number) => {
        const today = new Date();
        return day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
    };

    const getMeetingsForDay = (day: number) => {
        return meetings.filter(m => {
            const mDate = new Date(m.start_time);
            return mDate.getDate() === day && mDate.getMonth() === currentDate.getMonth() && mDate.getFullYear() === currentDate.getFullYear();
        });
    };

    return (
        <Card className="p-6 border-none shadow-xl bg-white rounded-3xl overflow-hidden">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-black text-gray-900">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Your Schedule</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={prevMonth} className="p-2 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100">
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <button onClick={nextMonth} className="p-2 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100">
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-4 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-[10px] font-black text-gray-400 uppercase tracking-tighter">{day}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-4">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square"></div>
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dayMeetings = getMeetingsForDay(day);
                    return (
                        <div key={day} className="relative group">
                            <div
                                className={`aspect-square rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all border-2 ${isToday(day)
                                        ? 'bg-[var(--primary)] border-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/30'
                                        : dayMeetings.length > 0
                                            ? 'bg-indigo-50 border-indigo-100 text-indigo-900 font-bold'
                                            : 'border-transparent hover:border-gray-100 bg-gray-50/50 text-gray-600'
                                    }`}
                            >
                                <span className="text-sm">{day}</span>
                                {dayMeetings.length > 0 && !isToday(day) && (
                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1"></div>
                                )}
                            </div>

                            {/* Hover Details */}
                            {dayMeetings.length > 0 && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-gray-900 text-white p-3 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Meetings for the {day}th</p>
                                    <div className="space-y-2">
                                        {dayMeetings.map(m => (
                                            <div key={m.id} className="text-xs">
                                                <div className="font-bold flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full"></div>
                                                    {m.title}
                                                </div>
                                                <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5 ml-3">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(m.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-10 space-y-4">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Next Meetings</h3>
                {meetings.length === 0 ? (
                    <div className="p-8 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                        <CalendarIcon className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-400 font-medium">No meetings scheduled yet</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {meetings.slice(0, 3).map(m => (
                            <div key={m.id} className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 transition-all rounded-2xl border border-gray-100 group">
                                <div className="w-12 h-12 bg-white rounded-xl flex flex-col items-center justify-center shadow-sm border border-gray-100">
                                    <span className="text-[10px] font-black text-[var(--primary)] uppercase leading-none">
                                        {new Date(m.start_time).toLocaleString('default', { month: 'short' })}
                                    </span>
                                    <span className="text-lg font-black text-gray-900 leading-none">
                                        {new Date(m.start_time).getDate()}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-gray-900">{m.title}</h4>
                                    <div className="flex items-center gap-3 mt-1">
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                                            <Clock className="w-3 h-3" />
                                            {new Date(m.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        {m.meeting_link && (
                                            <a href={m.meeting_link} target="_blank" className="flex items-center gap-1 text-[10px] font-bold text-[var(--primary)] hover:underline">
                                                <LinkIcon className="w-3 h-3" />
                                                Join Now
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Card>
    );
}
