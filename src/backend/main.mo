import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import List "mo:core/List";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  public type UserProfile = {
    recoveryStartDate : ?Int; // Timestamp
    currentStreak : Nat;
    longestStreak : Nat;
    lastCheckInDate : ?Text;
  };

  type MutableUserProfile = {
    var recoveryStartDate : ?Int;
    var currentStreak : Nat;
    var longestStreak : Nat;
    var lastCheckInDate : ?Text;
  };

  public type CheckIn = {
    id : Nat;
    date : Text;
    wasClean : Bool;
    note : Text;
  };

  public type UrgeLog = {
    id : Nat;
    timestamp : Int;
    intensity : Nat;
    triggers : [Text];
    note : Text;
  };

  public type JournalEntry = {
    id : Nat;
    timestamp : Int;
    date : Text;
    content : Text;
  };

  public type Milestone = {
    id : Text;
    milestoneLabel : Text;
    daysRequired : Nat;
    earned : Bool;
  };

  public type Stats = {
    totalDaysClean : Nat;
    currentStreak : Nat;
    longestStreak : Nat;
    urgeCount : Nat;
    journalCount : Nat;
  };

  // Persistent storage
  let profiles = Map.empty<Principal, MutableUserProfile>();
  let checkIns = Map.empty<Principal, Map.Map<Nat, CheckIn>>();
  let urgeLogs = Map.empty<Principal, Map.Map<Nat, UrgeLog>>();
  let journalEntries = Map.empty<Principal, Map.Map<Nat, JournalEntry>>();

  // Milestone data
  let milestoneData = [
    { id = "1"; milestoneLabel = "Day 1"; daysRequired = 1 },
    { id = "3"; milestoneLabel = "3 Days"; daysRequired = 3 },
    { id = "7"; milestoneLabel = "1 Week"; daysRequired = 7 },
    { id = "14"; milestoneLabel = "2 Weeks"; daysRequired = 14 },
    { id = "30"; milestoneLabel = "1 Month"; daysRequired = 30 },
    { id = "60"; milestoneLabel = "2 Months"; daysRequired = 60 },
    { id = "90"; milestoneLabel = "3 Months"; daysRequired = 90 },
    { id = "180"; milestoneLabel = "6 Months"; daysRequired = 180 },
    { id = "365"; milestoneLabel = "1 Year"; daysRequired = 365 },
  ];

  module CheckIn {
    public func compareByDateDescending(a : CheckIn, b : CheckIn) : Order.Order {
      Text.compare(b.date, a.date);
    };
  };

  module UrgeLog {
    public func compareByTimestampDescending(a : UrgeLog, b : UrgeLog) : Order.Order {
      Int.compare(b.timestamp, a.timestamp);
    };
  };

  module JournalEntry {
    public func compareByTimestampDescending(a : JournalEntry, b : JournalEntry) : Order.Order {
      Int.compare(b.timestamp, a.timestamp);
    };
  };

  // Helper functions
  func getOrCreateProfileInternal(user : Principal) : MutableUserProfile {
    switch (profiles.get(user)) {
      case (?profile) { profile };
      case (null) {
        let defaultProfile : MutableUserProfile = {
          var recoveryStartDate = null;
          var currentStreak = 0;
          var longestStreak = 0;
          var lastCheckInDate = null;
        };
        profiles.add(user, defaultProfile);
        defaultProfile;
      };
    };
  };

  func getOrCreateCheckIns(caller : Principal) : Map.Map<Nat, CheckIn> {
    switch (checkIns.get(caller)) {
      case (?checks) { checks };
      case (null) {
        let newChecks = Map.empty<Nat, CheckIn>();
        checkIns.add(caller, newChecks);
        newChecks;
      };
    };
  };

  func getOrCreateUrgeLogs(caller : Principal) : Map.Map<Nat, UrgeLog> {
    switch (urgeLogs.get(caller)) {
      case (?logs) { logs };
      case (null) {
        let newLogs = Map.empty<Nat, UrgeLog>();
        urgeLogs.add(caller, newLogs);
        newLogs;
      };
    };
  };

  func getOrCreateJournalEntries(caller : Principal) : Map.Map<Nat, JournalEntry> {
    switch (journalEntries.get(caller)) {
      case (?entries) { entries };
      case (null) {
        let newEntries = Map.empty<Nat, JournalEntry>();
        journalEntries.add(caller, newEntries);
        newEntries;
      };
    };
  };

  func toImmutableProfile(mutable : MutableUserProfile) : UserProfile {
    {
      recoveryStartDate = mutable.recoveryStartDate;
      currentStreak = mutable.currentStreak;
      longestStreak = mutable.longestStreak;
      lastCheckInDate = mutable.lastCheckInDate;
    };
  };

  // Required profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    switch (profiles.get(caller)) {
      case (?profile) { ?toImmutableProfile(profile) };
      case (null) { null };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (profiles.get(user)) {
      case (?profile) { ?toImmutableProfile(profile) };
      case (null) { null };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    let mutableProfile : MutableUserProfile = {
      var recoveryStartDate = profile.recoveryStartDate;
      var currentStreak = profile.currentStreak;
      var longestStreak = profile.longestStreak;
      var lastCheckInDate = profile.lastCheckInDate;
    };
    profiles.add(caller, mutableProfile);
  };

  // Recovery app functions
  public query ({ caller }) func getProfile() : async {
    recoveryStartDate : ?Int;
    currentStreak : Nat;
    longestStreak : Nat;
    lastCheckInDate : ?Text;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access their profile");
    };
    let profile = getOrCreateProfileInternal(caller);
    {
      recoveryStartDate = profile.recoveryStartDate;
      currentStreak = profile.currentStreak;
      longestStreak = profile.longestStreak;
      lastCheckInDate = profile.lastCheckInDate;
    };
  };

  public shared ({ caller }) func setRecoveryStartDate(startDateStr : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set recovery start date");
    };
    let profile = getOrCreateProfileInternal(caller);
    let currentTime = Time.now();
    profile.recoveryStartDate := ?currentTime;
    profile.currentStreak := 0;
    profile.longestStreak := 0;
    profile.lastCheckInDate := ?startDateStr;
  };

  public shared ({ caller }) func submitCheckIn(date : Text, wasClean : Bool, note : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit check-ins");
    };
    let checkInsByUser = getOrCreateCheckIns(caller);

    let checkInId = checkInsByUser.size() + 1;

    let checkIn : CheckIn = {
      id = checkInId;
      date;
      wasClean;
      note;
    };

    checkInsByUser.add(checkInId, checkIn);

    let profile = getOrCreateProfileInternal(caller);
    switch (profile.lastCheckInDate) {
      case (?lastDate) {
        if (wasClean) {
          profile.currentStreak += 1;
          if (profile.currentStreak > profile.longestStreak) {
            profile.longestStreak := profile.currentStreak;
          };
        } else {
          profile.currentStreak := 0;
        };
        profile.lastCheckInDate := ?date;
      };
      case (null) {
        profile.currentStreak := if (wasClean) { 1 } else { 0 };
        profile.longestStreak := profile.currentStreak;
        profile.lastCheckInDate := ?date;
      };
    };
  };

  public query ({ caller }) func getCheckIns() : async [CheckIn] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access their check-ins");
    };
    let checkInsByUser = getOrCreateCheckIns(caller);
    checkInsByUser.values().toArray().sort(CheckIn.compareByDateDescending);
  };

  public shared ({ caller }) func logUrge(intensity : Nat, triggers : [Text], note : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can log urges");
    };
    let urgeLogsByUser = getOrCreateUrgeLogs(caller);

    if (intensity < 1 or intensity > 5) {
      Runtime.trap("Intensity must be between 1 and 5");
    };

    let urgeLogId = urgeLogsByUser.size() + 1;
    let timestamp = Time.now();

    let urgeLog : UrgeLog = {
      id = urgeLogId;
      timestamp;
      intensity;
      triggers;
      note;
    };

    urgeLogsByUser.add(urgeLogId, urgeLog);
  };

  public query ({ caller }) func getUrgeLogs() : async [UrgeLog] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access their urge logs");
    };
    let urgeLogsByUser = getOrCreateUrgeLogs(caller);
    urgeLogsByUser.values().toArray().sort(UrgeLog.compareByTimestampDescending);
  };

  public shared ({ caller }) func addJournalEntry(content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add journal entries");
    };
    let journalEntriesByUser = getOrCreateJournalEntries(caller);

    let journalEntryId = journalEntriesByUser.size() + 1;
    let timestamp = Time.now();
    let date = "2021-01-01"; // TODO: Use real date

    let journalEntry : JournalEntry = {
      id = journalEntryId;
      timestamp;
      date;
      content;
    };

    journalEntriesByUser.add(journalEntryId, journalEntry);
  };

  public query ({ caller }) func getJournalEntries() : async [JournalEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access their journal entries");
    };
    let journalEntriesByUser = getOrCreateJournalEntries(caller);
    journalEntriesByUser.values().toArray().sort(JournalEntry.compareByTimestampDescending);
  };

  public query ({ caller }) func getStats() : async Stats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access their stats");
    };
    let urgeLogsByUser = getOrCreateUrgeLogs(caller);
    let journalEntriesByUser = getOrCreateJournalEntries(caller);

    let profile = getOrCreateProfileInternal(caller);
    {
      totalDaysClean = profile.longestStreak;
      currentStreak = profile.currentStreak;
      longestStreak = profile.longestStreak;
      urgeCount = urgeLogsByUser.size();
      journalCount = journalEntriesByUser.size();
    };
  };

  public query ({ caller }) func getMilestones() : async [Milestone] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access their milestones");
    };
    let profile = getOrCreateProfileInternal(caller);
    let currentStreak = profile.currentStreak;

    milestoneData.map(func(m) { { m with earned = currentStreak >= m.daysRequired } });
  };
};
